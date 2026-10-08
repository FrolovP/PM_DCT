const express = require('express');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const { authorize } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// ============================================
// Получение всех API ключей пользователя
// ============================================
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const keys = await db.query(
      `SELECT ak.*, u.name as user_name 
       FROM api_keys ak 
       LEFT JOIN users u ON ak.user_id = u.id 
       ORDER BY ak.created_at DESC`
    );
    res.json({ apiKeys: keys });
  } catch (error) {
    console.error('Ошибка получения API ключей:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Создание нового API ключа
// ============================================
router.post('/', authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Название обязательно'),
  body('permissions').optional().isArray(),
  body('rateLimit').optional().isInt({ min: 1 }),
  body('expiresInDays').optional().isInt({ min: 1 })
], auditLog('create_api_key', 'api_keys'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, permissions, rateLimit, expiresInDays } = req.body;
    const id = uuidv4();
    
    // Генерация API ключа
    const apiKey = `pk_${crypto.randomBytes(32).toString('hex')}`;
    
    // Вычисление срока действия
    let expiresAt = null;
    if (expiresInDays) {
      expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    }

    await db.query(
      `INSERT INTO api_keys (id, user_id, name, api_key, permissions, rate_limit, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        req.user.id,
        name,
        apiKey,
        permissions ? JSON.stringify(permissions) : null,
        rateLimit || 1000,
        expiresAt
      ]
    );

    res.status(201).json({
      id,
      name,
      apiKey,
      permissions: permissions || [],
      rateLimit: rateLimit || 1000,
      expiresAt,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Ошибка создания API ключа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Деактивация API ключа
// ============================================
router.put('/:id/deactivate', authorize('admin'), auditLog('deactivate_api_key', 'api_keys'), async (req, res) => {
  try {
    await db.query('UPDATE api_keys SET is_active = FALSE WHERE id = ?', [req.params.id]);
    res.json({ message: 'API ключ деактивирован' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Активация API ключа
// ============================================
router.put('/:id/activate', authorize('admin'), auditLog('activate_api_key', 'api_keys'), async (req, res) => {
  try {
    await db.query('UPDATE api_keys SET is_active = TRUE WHERE id = ?', [req.params.id]);
    res.json({ message: 'API ключ активирован' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Удаление API ключа
// ============================================
router.delete('/:id', authorize('admin'), auditLog('delete_api_key', 'api_keys'), async (req, res) => {
  try {
    await db.query('DELETE FROM api_keys WHERE id = ?', [req.params.id]);
    res.json({ message: 'API ключ удалён' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Получение статистики API ключа
// ============================================
router.get('/:id/stats', authorize('admin'), async (req, res) => {
  try {
    const stats = await db.query(
      `SELECT 
        COUNT(*) as total_requests,
        AVG(duration_ms) as avg_duration,
        MAX(created_at) as last_request,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count
       FROM api_logs 
       WHERE api_key_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [req.params.id]
    );
    res.json({ stats: stats[0] });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Получение логов API
// ============================================
router.get('/logs', authorize('admin'), async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const logs = await db.query(
      `SELECT al.*, ak.name as key_name 
       FROM api_logs al 
       LEFT JOIN api_keys ak ON al.api_key_id = ak.id 
       ORDER BY al.created_at DESC 
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
