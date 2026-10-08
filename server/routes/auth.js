const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const { generateToken, authenticate } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// ============================================
// Вход в систему
// ============================================
router.post('/login', [
  body('login').trim().notEmpty().withMessage('Логин обязателен'),
  body('password').notEmpty().withMessage('Пароль обязателен')
], async (req, res) => {
  try {
    // Проверка валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { login, password } = req.body;

    // Поиск пользователя
    const users = await db.query(
      'SELECT * FROM users WHERE login = ? AND is_active = TRUE',
      [login]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const user = users[0];

    // Проверка блокировки
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(423).json({ 
        error: 'Аккаунт заблокирован',
        lockedUntil: user.locked_until
      });
    }

    // Проверка пароля
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      // Увеличение счётчика неудачных попыток
      const loginAttempts = user.login_attempts + 1;
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
      
      let lockedUntil = null;
      if (loginAttempts >= maxAttempts) {
        const lockoutDuration = parseInt(process.env.LOCKOUT_DURATION || '900');
        lockedUntil = new Date(Date.now() + lockoutDuration * 1000);
      }

      await db.query(
        'UPDATE users SET login_attempts = ?, locked_until = ? WHERE id = ?',
        [loginAttempts, lockedUntil, user.id]
      );

      return res.status(401).json({ 
        error: 'Неверный логин или пароль',
        attemptsLeft: maxAttempts - loginAttempts
      });
    }

    // Успешный вход - сброс счётчика попыток
    await db.query(
      'UPDATE users SET login_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Генерация токена
    const token = generateToken(user);

    // Создание сессии
    const sessionId = uuidv4();
    const sessionTimeout = parseInt(process.env.SESSION_TIMEOUT || '86400');
    const expiresAt = new Date(Date.now() + sessionTimeout * 1000);

    await db.query(
      `INSERT INTO sessions (id, user_id, token, ip_address, user_agent, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sessionId, user.id, token, req.ip, req.get('user-agent'), expiresAt]
    );

    // Логирование входа
    await db.query(
      `INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, ip_address, user_agent)
       VALUES (?, ?, ?, 'login', 'user', ?, ?, ?)`,
      [uuidv4(), user.id, user.name, user.id, req.ip, req.get('user-agent')]
    );

    res.json({
      token,
      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        email: user.email,
        role: user.role,
        officeId: user.office_id
      }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Выход из системы
// ============================================
router.post('/logout', authenticate, async (req, res) => {
  try {
    // Удаление сессии
    await db.query('DELETE FROM sessions WHERE token = ?', [req.token]);

    // Логирование выхода
    await db.query(
      `INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, ip_address, user_agent)
       VALUES (?, ?, ?, 'logout', 'user', ?, ?, ?)`,
      [uuidv4(), req.user.id, req.user.name, req.user.id, req.ip, req.get('user-agent')]
    );

    res.json({ message: 'Выход выполнен успешно' });
  } catch (error) {
    console.error('Ошибка выхода:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Проверка токена
// ============================================
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        login: req.user.login,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        officeId: req.user.office_id
      }
    });
  } catch (error) {
    console.error('Ошибка проверки токена:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Смена пароля
// ============================================
router.post('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Текущий пароль обязателен'),
  body('newPassword').isLength({ min: 8 }).withMessage('Новый пароль должен быть минимум 8 символов')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Получение пользователя с паролем
    const users = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const user = users[0];

    // Проверка текущего пароля
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Неверный текущий пароль' });
    }

    // Хеширование нового пароля
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Обновление пароля
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newPasswordHash, req.user.id]);

    // Удаление всех сессий кроме текущей
    await db.query('DELETE FROM sessions WHERE user_id = ? AND token != ?', [req.user.id, req.token]);

    // Логирование
    await db.query(
      `INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, ip_address, user_agent)
       VALUES (?, ?, ?, 'change_password', 'user', ?, ?, ?)`,
      [uuidv4(), req.user.id, req.user.name, req.user.id, req.ip, req.get('user-agent')]
    );

    res.json({ message: 'Пароль успешно изменён' });
  } catch (error) {
    console.error('Ошибка смены пароля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Получение активных сессий
// ============================================
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const sessions = await db.query(
      `SELECT id, ip_address, user_agent, expires_at, created_at
       FROM sessions
       WHERE user_id = ? AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ sessions });
  } catch (error) {
    console.error('Ошибка получения сессий:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Завершение сессии
// ============================================
router.delete('/sessions/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Проверка, что сессия принадлежит пользователю
    const sessions = await db.query(
      'SELECT * FROM sessions WHERE id = ? AND user_id = ?',
      [sessionId, req.user.id]
    );

    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Сессия не найдена' });
    }

    // Удаление сессии
    await db.query('DELETE FROM sessions WHERE id = ?', [sessionId]);

    res.json({ message: 'Сессия завершена' });
  } catch (error) {
    console.error('Ошибка завершения сессии:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
