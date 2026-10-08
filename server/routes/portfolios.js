const express = require('express');
const db = require('../database/db');
const { authorize } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const portfolios = await db.query('SELECT * FROM portfolios ORDER BY created_at DESC');
    res.json({ portfolios });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const portfolios = await db.query('SELECT * FROM portfolios WHERE id = ?', [req.params.id]);
    if (portfolios.length === 0) return res.status(404).json({ error: 'Портфель не найден' });
    res.json({ portfolio: portfolios[0] });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/', authorize('admin', 'office_director'), auditLog('create_portfolio', 'portfolios'), async (req, res) => {
  try {
    const { name, description, type, office_id, strategic_goal } = req.body;
    const id = uuidv4();
    await db.query(
      'INSERT INTO portfolios (id, name, description, type, office_id, strategic_goal) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, description || '', type || 'business', office_id, strategic_goal || '']
    );
    res.status(201).json({ id, name, description, type, office_id, strategic_goal });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.put('/:id', authorize('admin', 'office_director'), auditLog('update_portfolio', 'portfolios'), async (req, res) => {
  try {
    const { name, description, type, strategic_goal } = req.body;
    await db.query(
      'UPDATE portfolios SET name = ?, description = ?, type = ?, strategic_goal = ? WHERE id = ?',
      [name, description, type, strategic_goal, req.params.id]
    );
    res.json({ message: 'Портфель обновлён' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/:id', authorize('admin', 'office_director'), auditLog('delete_portfolio', 'portfolios'), async (req, res) => {
  try {
    await db.query('DELETE FROM portfolios WHERE id = ?', [req.params.id]);
    res.json({ message: 'Портфель удалён' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
