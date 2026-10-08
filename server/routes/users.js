const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const { authorize } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Получить всех пользователей
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const users = await db.query(`
      SELECT u.*, po.name as office_name 
      FROM users u 
      LEFT JOIN project_offices po ON u.office_id = po.id 
      ORDER BY u.created_at DESC
    `);
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить пользователя по ID
router.get('/:id', authorize('admin'), async (req, res) => {
  try {
    const users = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (users.length === 0) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json({ user: users[0] });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать пользователя
router.post('/', authorize('admin'), [
  body('login').trim().notEmpty(),
  body('password').isLength({ min: 8 }),
  body('name').trim().notEmpty(),
  body('email').isEmail(),
  body('role').isIn(['admin', 'office_director', 'project_manager', 'team_member', 'viewer'])
], auditLog('create_user', 'users'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { login, password, name, email, role, office_id } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await db.query(
      'INSERT INTO users (id, login, password_hash, name, email, role, office_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, login, passwordHash, name, email, role, office_id || null]
    );

    res.status(201).json({ id, login, name, email, role, office_id });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Пользователь с таким логином или email уже существует' });
    }
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить пользователя
router.put('/:id', authorize('admin'), auditLog('update_user', 'users'), async (req, res) => {
  try {
    const { name, email, role, office_id, is_active } = req.body;
    
    await db.query(
      'UPDATE users SET name = ?, email = ?, role = ?, office_id = ?, is_active = ? WHERE id = ?',
      [name, email, role, office_id || null, is_active !== undefined ? is_active : true, req.params.id]
    );

    res.json({ message: 'Пользователь обновлён' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить пользователя
router.delete('/:id', authorize('admin'), auditLog('delete_user', 'users'), async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'Пользователь удалён' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Сбросить пароль
router.post('/:id/reset-password', authorize('admin'), auditLog('reset_password', 'users'), async (req, res) => {
  try {
    const { newPassword } = req.body;
    const passwordHash = await bcrypt.hash(newPassword || 'password123', 10);
    
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, req.params.id]);
    res.json({ message: 'Пароль сброшен' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
