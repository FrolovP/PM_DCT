const express = require('express');
const db = require('../database/db');
const { auditLog } = require('../middleware/audit');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.get('/project/:projectId', async (req, res) => {
  try {
    const documents = await db.query('SELECT * FROM documents WHERE project_id = ? ORDER BY created_at DESC', [req.params.projectId]);
    res.json({ documents });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/', auditLog('create_document', 'documents'), async (req, res) => {
  try {
    const { project_id, title, category, description, author, version, content } = req.body;
    const id = uuidv4();
    await db.query(
      'INSERT INTO documents (id, project_id, title, category, description, author, version, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, project_id, title, category || 'other', description || '', author || '', version || '1.0', content || '']
    );
    res.status(201).json({ id, project_id, title, category });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.put('/:id', auditLog('update_document', 'documents'), async (req, res) => {
  try {
    const { title, category, description, author, version, content } = req.body;
    await db.query(
      'UPDATE documents SET title = ?, category = ?, description = ?, author = ?, version = ?, content = ? WHERE id = ?',
      [title, category, description, author, version, content, req.params.id]
    );
    res.json({ message: 'Документ обновлён' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/:id', auditLog('delete_document', 'documents'), async (req, res) => {
  try {
    await db.query('DELETE FROM documents WHERE id = ?', [req.params.id]);
    res.json({ message: 'Документ удалён' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
