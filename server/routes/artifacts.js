const express = require('express');
const db = require('../database/db');
const { auditLog } = require('../middleware/audit');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.get('/project/:projectId', async (req, res) => {
  try {
    const artifacts = await db.query('SELECT * FROM artifacts WHERE project_id = ? ORDER BY created_at DESC', [req.params.projectId]);
    res.json({ artifacts });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/', auditLog('create_artifact', 'artifacts'), async (req, res) => {
  try {
    const { project_id, title, type, description, author, version } = req.body;
    const id = uuidv4();
    await db.query(
      'INSERT INTO artifacts (id, project_id, title, type, description, author, version) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, project_id, title, type || 'other', description || '', author || '', version || '1.0']
    );
    res.status(201).json({ id, project_id, title, type });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.put('/:id', auditLog('update_artifact', 'artifacts'), async (req, res) => {
  try {
    const { title, type, description, author, version } = req.body;
    await db.query(
      'UPDATE artifacts SET title = ?, type = ?, description = ?, author = ?, version = ? WHERE id = ?',
      [title, type, description, author, version, req.params.id]
    );
    res.json({ message: 'Артефакт обновлён' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/:id', auditLog('delete_artifact', 'artifacts'), async (req, res) => {
  try {
    await db.query('DELETE FROM artifacts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Артефакт удалён' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
