const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const { authorize } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// ============================================
// Получение всех настроек
// ============================================
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const settings = await db.query('SELECT * FROM system_settings ORDER BY setting_key');
    
    // Преобразование в объект
    const settingsObj = {};
    settings.forEach(s => {
      let value = s.setting_value;
      if (s.setting_type === 'number') value = Number(value);
      if (s.setting_type === 'boolean') value = value === 'true';
      if (s.setting_type === 'json') {
        try { value = JSON.parse(value); } catch (e) {}
      }
      settingsObj[s.setting_key] = {
        value,
        type: s.setting_type,
        description: s.description
      };
    });
    
    res.json({ settings: settingsObj });
  } catch (error) {
    console.error('Ошибка получения настроек:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Получение одной настройки
// ============================================
router.get('/:key', authorize('admin'), async (req, res) => {
  try {
    const { key } = req.params;
    const settings = await db.query('SELECT * FROM system_settings WHERE setting_key = ?', [key]);
    
    if (settings.length === 0) {
      return res.status(404).json({ error: 'Настройка не найдена' });
    }
    
    res.json({ setting: settings[0] });
  } catch (error) {
    console.error('Ошибка получения настройки:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Обновление настройки
// ============================================
router.put('/:key', authorize('admin'), [
  body('value').exists().withMessage('Значение обязательно'),
  body('type').optional().isIn(['string', 'number', 'boolean', 'json'])
], auditLog('update_setting', 'system_settings'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { key } = req.params;
    const { value, type, description } = req.body;

    // Проверка существования настройки
    const existing = await db.query('SELECT * FROM system_settings WHERE setting_key = ?', [key]);
    
    if (existing.length === 0) {
      // Создание новой настройки
      const settingType = type || 'string';
      const settingValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      await db.query(
        `INSERT INTO system_settings (id, setting_key, setting_value, setting_type, description)
         VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), key, settingValue, settingType, description || '']
      );
    } else {
      // Обновление существующей
      const settingType = type || existing[0].setting_type;
      const settingValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      await db.query(
        'UPDATE system_settings SET setting_value = ?, setting_type = ?, description = ? WHERE setting_key = ?',
        [settingValue, settingType, description || existing[0].description, key]
      );
    }

    res.json({ message: 'Настройка обновлена', key, value });
  } catch (error) {
    console.error('Ошибка обновления настройки:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Массовое обновление настроек
// ============================================
router.put('/', authorize('admin'), auditLog('update_settings', 'system_settings'), async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Неверный формат настроек' });
    }

    // Обновление каждой настройки
    for (const [key, value] of Object.entries(settings)) {
      const settingValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      const settingType = typeof value === 'boolean' ? 'boolean' : 
                          typeof value === 'number' ? 'number' : 'string';
      
      await db.query(
        `INSERT INTO system_settings (id, setting_key, setting_value, setting_type)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE setting_value = ?, setting_type = ?`,
        [uuidv4(), key, settingValue, settingType, settingValue, settingType]
      );
    }

    res.json({ message: 'Настройки обновлены' });
  } catch (error) {
    console.error('Ошибка массового обновления настроек:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Удаление настройки
// ============================================
router.delete('/:key', authorize('admin'), auditLog('delete_setting', 'system_settings'), async (req, res) => {
  try {
    const { key } = req.params;
    
    await db.query('DELETE FROM system_settings WHERE setting_key = ?', [key]);
    
    res.json({ message: 'Настройка удалена' });
  } catch (error) {
    console.error('Ошибка удаления настройки:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Сброс настроек к значениям по умолчанию
// ============================================
router.post('/reset', authorize('admin'), auditLog('reset_settings', 'system_settings'), async (req, res) => {
  try {
    // Удаление всех настроек
    await db.query('DELETE FROM system_settings');
    
    // Вставка значений по умолчанию
    const defaultSettings = [
      { key: 'platform_name', value: 'Платформа проектных офисов', type: 'string', description: 'Название платформы' },
      { key: 'platform_logo', value: '🏢', type: 'string', description: 'Логотип платформы (emoji)' },
      { key: 'primary_color', value: '#4f46e5', type: 'string', description: 'Основной цвет темы' },
      { key: 'theme', value: 'light', type: 'string', description: 'Тема оформления (light/dark)' },
      { key: 'session_timeout', value: '3600', type: 'number', description: 'Таймаут сессии в секундах' },
      { key: 'password_min_length', value: '8', type: 'number', description: 'Минимальная длина пароля' },
      { key: 'password_require_uppercase', value: 'true', type: 'boolean', description: 'Требовать заглавные буквы' },
      { key: 'password_require_numbers', value: 'true', type: 'boolean', description: 'Требовать цифры' },
      { key: 'password_require_special', value: 'false', type: 'boolean', description: 'Требовать спецсимволы' },
      { key: 'max_login_attempts', value: '5', type: 'number', description: 'Максимальное количество попыток входа' },
      { key: 'lockout_duration', value: '900', type: 'number', description: 'Длительность блокировки в секундах' },
      { key: 'enable_registration', value: 'false', type: 'boolean', description: 'Разрешить регистрацию' },
      { key: 'enable_notifications', value: 'true', type: 'boolean', description: 'Включить уведомления' },
      { key: 'maintenance_mode', value: 'false', type: 'boolean', description: 'Режим обслуживания' }
    ];

    for (const setting of defaultSettings) {
      await db.query(
        `INSERT INTO system_settings (id, setting_key, setting_value, setting_type, description)
         VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), setting.key, setting.value, setting.type, setting.description]
      );
    }

    res.json({ message: 'Настройки сброшены к значениям по умолчанию' });
  } catch (error) {
    console.error('Ошибка сброса настроек:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
