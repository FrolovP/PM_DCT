const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const { authorize } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// CRUD для офисов
router.get('/', async (req, res) => {
  try {
    const offices = await db.query('SELECT * FROM project_offices ORDER BY created_at DESC');
    res.json({ offices });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const offices = await db.query('SELECT * FROM project_offices WHERE id = ?', [req.params.id]);
    if (offices.length === 0) return res.status(404).json({ error: 'Офис не найден' });
    res.json({ office: offices[0] });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/', authorize('admin', 'office_director'), auditLog('create_office', 'offices'), async (req, res) => {
  try {
    const { name, description, color, icon, director } = req.body;
    const id = uuidv4();
    await db.query(
      'INSERT INTO project_offices (id, name, description, color, icon, director) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, description || '', color || '#4f46e5', icon || '🏢', director || '']
    );
    res.status(201).json({ id, name, description, color, icon, director });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.put('/:id', authorize('admin', 'office_director'), auditLog('update_office', 'offices'), async (req, res) => {
  try {
    const { name, description, color, icon, director } = req.body;
    await db.query(
      'UPDATE project_offices SET name = ?, description = ?, color = ?, icon = ?, director = ? WHERE id = ?',
      [name, description, color, icon, director, req.params.id]
    );
    res.json({ message: 'Офис обновлён' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/:id', authorize('admin'), auditLog('delete_office', 'offices'), async (req, res) => {
  try {
    await db.query('DELETE FROM project_offices WHERE id = ?', [req.params.id]);
    res.json({ message: 'Офис удалён' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
