const express = require('express');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const { authorize } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// ============================================
// Получение всех webhook'ов
// ============================================
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const webhooks = await db.query('SELECT * FROM webhooks ORDER BY created_at DESC');
    res.json({ webhooks });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Создание webhook'а
// ============================================
router.post('/', authorize('admin'), [
  body('name').trim().notEmpty(),
  body('url').isURL(),
  body('events').isArray().optional()
], auditLog('create_webhook', 'webhooks'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, url, events, secret } = req.body;
    const id = uuidv4();
    const webhookSecret = secret || crypto.randomBytes(32).toString('hex');

    await db.query(
      'INSERT INTO webhooks (id, name, url, secret, events) VALUES (?, ?, ?, ?, ?)',
      [id, name, url, webhookSecret, events ? JSON.stringify(events) : null]
    );

    res.status(201).json({ id, name, url, secret: webhookSecret, events: events || [] });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Обновление webhook'а
// ============================================
router.put('/:id', authorize('admin'), auditLog('update_webhook', 'webhooks'), async (req, res) => {
  try {
    const { name, url, events, is_active } = req.body;
    await db.query(
      'UPDATE webhooks SET name = ?, url = ?, events = ?, is_active = ? WHERE id = ?',
      [name, url, events ? JSON.stringify(events) : null, is_active !== undefined ? is_active : true, req.params.id]
    );
    res.json({ message: 'Webhook обновлён' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Удаление webhook'а
// ============================================
router.delete('/:id', authorize('admin'), auditLog('delete_webhook', 'webhooks'), async (req, res) => {
  try {
    await db.query('DELETE FROM webhooks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Webhook удалён' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Тестирование webhook'а
// ============================================
router.post('/:id/test', authorize('admin'), async (req, res) => {
  try {
    const webhooks = await db.query('SELECT * FROM webhooks WHERE id = ?', [req.params.id]);
    if (webhooks.length === 0) return res.status(404).json({ error: 'Webhook не найден' });

    const webhook = webhooks[0];
    
    // Отправка тестового события
    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      data: { message: 'Тестовое событие от платформы проектных офисов' }
    };

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhook.secret
      },
      body: JSON.stringify(testPayload)
    });

    res.json({
      status: response.status,
      statusText: response.statusText,
      message: response.ok ? 'Webhook успешно отправлен' : 'Ошибка отправки webhook'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// Логи webhook'ов
// ============================================
router.get('/:id/logs', authorize('admin'), async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const logs = await db.query(
      'SELECT * FROM webhook_logs WHERE webhook_id = ? ORDER BY created_at DESC LIMIT ?',
      [req.params.id, parseInt(limit)]
    );
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Функция отправки webhook события
// ============================================
async function triggerWebhook(event, data) {
  try {
    const webhooks = await db.query(
      'SELECT * FROM webhooks WHERE is_active = TRUE'
    );

    for (const webhook of webhooks) {
      const events = webhook.events ? JSON.parse(webhook.events) : [];
      
      // Проверка, подписан ли webhook на это событие
      if (events.length > 0 && !events.includes(event) && !events.includes('*')) {
        continue;
      }

      const payload = {
        event,
        timestamp: new Date().toISOString(),
        data
      };

      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': webhook.secret,
            'X-Webhook-Event': event
          },
          body: JSON.stringify(payload)
        });

        // Логирование
        await db.query(
          `INSERT INTO webhook_logs (id, webhook_id, event, payload, response_status, response_body, success)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            webhook.id,
            event,
            JSON.stringify(payload),
            response.status,
            await response.text().catch(() => ''),
            response.ok
          ]
        );

        // Обновление времени последнего триггера
        await db.query('UPDATE webhooks SET last_triggered = NOW() WHERE id = ?', [webhook.id]);
      } catch (error) {
        console.error(`Ошибка отправки webhook ${webhook.name}:`, error);
        
        await db.query(
          `INSERT INTO webhook_logs (id, webhook_id, event, payload, success)
           VALUES (?, ?, ?, ?, ?)`,
          [uuidv4(), webhook.id, event, JSON.stringify(payload), false]
        );
      }
    }
  } catch (error) {
    console.error('Ошибка triggerWebhook:', error);
  }
}

module.exports = router;
module.exports.triggerWebhook = triggerWebhook;
