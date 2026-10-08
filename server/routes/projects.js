const express = require('express');
const db = require('../database/db');
const { authorize, checkProjectAccess } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Получить все проекты
router.get('/', async (req, res) => {
  try {
    let sql = 'SELECT * FROM projects';
    const params = [];
    
    // Фильтрация по офису
    if (req.query.officeId) {
      sql += ' WHERE office_id = ?';
      params.push(req.query.officeId);
    }
    
    // Фильтрация по статусу
    if (req.query.status) {
      sql += params.length > 0 ? ' AND status = ?' : ' WHERE status = ?';
      params.push(req.query.status);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const projects = await db.query(sql, params);
    res.json({ projects });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить проект по ID
router.get('/:id', checkProjectAccess, async (req, res) => {
  try {
    const projects = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (projects.length === 0) return res.status(404).json({ error: 'Проект не найден' });
    
    const project = projects[0];
    
    // Загрузка связанных данных
    const [tasks, documents, artifacts, structure, links, knowledgeBase] = await Promise.all([
      db.query('SELECT * FROM tasks WHERE project_id = ?', [project.id]),
      db.query('SELECT * FROM documents WHERE project_id = ?', [project.id]),
      db.query('SELECT * FROM artifacts WHERE project_id = ?', [project.id]),
      db.query('SELECT * FROM structure_nodes WHERE project_id = ?', [project.id]),
      db.query('SELECT * FROM project_links WHERE project_id = ?', [project.id]),
      db.query('SELECT * FROM knowledge_base WHERE project_id = ?', [project.id])
    ]);
    
    res.json({ 
      project: {
        ...project,
        tasks,
        documents,
        artifacts,
        structure,
        links,
        knowledgeBase
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать проект
router.post('/', authorize('admin', 'office_director', 'project_manager'), auditLog('create_project', 'projects'), async (req, res) => {
  try {
    const { office_id, portfolio_id, name, type, status, priority, description, manager, start_date, end_date, budget, spent } = req.body;
    const id = uuidv4();
    
    await db.query(
      `INSERT INTO projects (id, office_id, portfolio_id, name, type, status, priority, description, manager, start_date, end_date, budget, spent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, office_id, portfolio_id || null, name, type, status || 'planning', priority || 'medium', description || '', manager || '', start_date || null, end_date || null, budget || 0, spent || 0]
    );
    
    res.status(201).json({ id, office_id, portfolio_id, name, type, status, priority });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить проект
router.put('/:id', checkProjectAccess, auditLog('update_project', 'projects'), async (req, res) => {
  try {
    const { name, type, status, priority, description, manager, start_date, end_date, progress, budget, spent } = req.body;
    
    await db.query(
      `UPDATE projects SET name = ?, type = ?, status = ?, priority = ?, description = ?, manager = ?, start_date = ?, end_date = ?, progress = ?, budget = ?, spent = ?
       WHERE id = ?`,
      [name, type, status, priority, description, manager, start_date, end_date, progress || 0, budget || 0, spent || 0, req.params.id]
    );
    
    res.json({ message: 'Проект обновлён' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить проект
router.delete('/:id', authorize('admin', 'office_director'), auditLog('delete_project', 'projects'), async (req, res) => {
  try {
    await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Проект удалён' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
