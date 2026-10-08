const express = require('express');
const db = require('../database/db');
const { authorize } = require('../middleware/auth');
const { getAuditLogs } = require('../middleware/audit');

const router = express.Router();

// Получить логи аудита
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const { userId, action, entityType, startDate, endDate, limit, offset } = req.query;
    
    const logs = await getAuditLogs({
      userId,
      action,
      entityType,
      startDate,
      endDate,
      limit: parseInt(limit) || 100,
      offset: parseInt(offset) || 0
    });
    
    res.json({ logs });
  } catch (error) {
    console.error('Ошибка получения логов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить статистику по логам
router.get('/stats', authorize('admin'), async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        action,
        COUNT(*) as count,
        MAX(created_at) as last_action
      FROM audit_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY action
      ORDER BY count DESC
    `);
    
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Очистить старые логи
router.delete('/cleanup', authorize('admin'), async (req, res) => {
  try {
    const { days } = req.body;
    const retentionDays = parseInt(days) || 90;
    
    const result = await db.query(
      'DELETE FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
      [retentionDays]
    );
    
    res.json({ 
      message: `Удалено записей: ${result.affectedRows || 0}`,
      retentionDays
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
