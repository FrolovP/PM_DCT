const express = require('express');
const db = require('../database/db');
const { auditLog } = require('../middleware/audit');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Задачи
router.get('/project/:projectId', async (req, res) => {
  try {
    const tasks = await db.query('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at', [req.params.projectId]);
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/', auditLog('create_task', 'tasks'), async (req, res) => {
  try {
    const { project_id, title, description, status, priority, assignee, due_date } = req.body;
    const id = uuidv4();
    await db.query(
      'INSERT INTO tasks (id, project_id, title, description, status, priority, assignee, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, project_id, title, description || '', status || 'todo', priority || 'medium', assignee || '', due_date || null]
    );
    res.status(201).json({ id, project_id, title, status, priority });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.put('/:id', auditLog('update_task', 'tasks'), async (req, res) => {
  try {
    const { title, description, status, priority, assignee, due_date, completed } = req.body;
    await db.query(
      'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, assignee = ?, due_date = ?, completed = ? WHERE id = ?',
      [title, description, status, priority, assignee, due_date, completed || false, req.params.id]
    );
    res.json({ message: 'Задача обновлена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/:id', auditLog('delete_task', 'tasks'), async (req, res) => {
  try {
    await db.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Задача удалена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
