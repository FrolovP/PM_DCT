const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

// Middleware для логирования действий
async function auditLog(action, entityType = null) {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Логируем только успешные изменения
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          let entityId = null;
          let details = null;

          // Получаем ID сущности из ответа
          if (typeof data === 'string') {
            try {
              const parsed = JSON.parse(data);
              entityId = parsed.id || req.params.id || req.params.projectId;
              details = parsed;
            } catch (e) {
              entityId = req.params.id || req.params.projectId;
            }
          } else if (data && typeof data === 'object') {
            entityId = data.id || req.params.id || req.params.projectId;
            details = data;
          } else {
            entityId = req.params.id || req.params.projectId;
          }

          // Асинхронное логирование (не блокирует ответ)
          setImmediate(async () => {
            try {
              await db.query(
                `INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, details, ip_address, user_agent)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  uuidv4(),
                  req.user?.id || null,
                  req.user?.name || 'Anonymous',
                  action,
                  entityType,
                  entityId,
                  details ? JSON.stringify(details) : null,
                  req.ip,
                  req.get('user-agent')
                ]
              );
            } catch (logError) {
              console.error('Ошибка логирования:', logError);
            }
          });
        } catch (error) {
          console.error('Ошибка в auditLog middleware:', error);
        }
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
}

// Функция для получения логов
async function getAuditLogs(filters = {}) {
  const { userId, action, entityType, startDate, endDate, limit = 100, offset = 0 } = filters;
  
  let sql = `
    SELECT 
      al.*,
      u.name as user_name,
      u.email as user_email
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (userId) {
    sql += ' AND al.user_id = ?';
    params.push(userId);
  }
  
  if (action) {
    sql += ' AND al.action = ?';
    params.push(action);
  }
  
  if (entityType) {
    sql += ' AND al.entity_type = ?';
    params.push(entityType);
  }
  
  if (startDate) {
    sql += ' AND al.created_at >= ?';
    params.push(startDate);
  }
  
  if (endDate) {
    sql += ' AND al.created_at <= ?';
    params.push(endDate);
  }
  
  sql += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  return await db.query(sql, params);
}

module.exports = {
  auditLog,
  getAuditLogs
};
