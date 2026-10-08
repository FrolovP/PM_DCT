const express = require('express');
const db = require('../database/db');
const { auditLog } = require('../middleware/audit');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// База знаний проекта
router.get('/project/:projectId', async (req, res) => {
  try {
    const kb = await db.query('SELECT * FROM knowledge_base WHERE project_id = ? ORDER BY created_at DESC', [req.params.projectId]);
    res.json({ knowledgeBase: kb });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/project', auditLog('create_kb_entry', 'knowledge_base'), async (req, res) => {
  try {
    const { project_id, title, content, category, author, access } = req.body;
    const id = uuidv4();
    await db.query(
      'INSERT INTO knowledge_base (id, project_id, title, content, category, author, access) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, project_id, title, content || '', category || '', author || '', access || 'public']
    );
    res.status(201).json({ id, project_id, title, category, access });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/:id', auditLog('delete_kb_entry', 'knowledge_base'), async (req, res) => {
  try {
    await db.query('DELETE FROM knowledge_base WHERE id = ?', [req.params.id]);
    res.json({ message: 'Запись удалена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Глобальная база знаний
router.get('/global', async (req, res) => {
  try {
    const kb = await db.query('SELECT * FROM global_knowledge_base ORDER BY created_at DESC');
    res.json({ knowledgeBase: kb });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/global', auditLog('create_global_kb_entry', 'global_knowledge_base'), async (req, res) => {
  try {
    const { title, content, category, author, access } = req.body;
    const id = uuidv4();
    await db.query(
      'INSERT INTO global_knowledge_base (id, title, content, category, author, access) VALUES (?, ?, ?, ?, ?, ?)',
      [id, title, content || '', category || '', author || '', access || 'public']
    );
    res.status(201).json({ id, title, category, access });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/global/:id', auditLog('delete_global_kb_entry', 'global_knowledge_base'), async (req, res) => {
  try {
    await db.query('DELETE FROM global_knowledge_base WHERE id = ?', [req.params.id]);
    res.json({ message: 'Запись удалена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
