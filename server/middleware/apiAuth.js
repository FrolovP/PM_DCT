const db = require('../database/db');

// Middleware для аутентификации по API ключу
async function apiKeyAuth(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API ключ не предоставлен' });
    }

    // Поиск API ключа
    const keys = await db.query(
      'SELECT * FROM api_keys WHERE api_key = ? AND is_active = TRUE',
      [apiKey]
    );

    if (keys.length === 0) {
      return res.status(401).json({ error: 'Недействительный API ключ' });
    }

    const key = keys[0];

    // Проверка срока действия
    if (key.expires_at && new Date(key.expires_at) < new Date()) {
      return res.status(401).json({ error: 'API ключ истёк' });
    }

    // Обновление времени последнего использования
    await db.query(
      'UPDATE api_keys SET last_used = NOW() WHERE id = ?',
      [key.id]
    );

    // Добавление информации о ключе в request
    req.apiKey = key;
    req.apiKeyId = key.id;
    req.apiPermissions = key.permissions ? JSON.parse(key.permissions) : [];
    
    next();
  } catch (error) {
    console.error('Ошибка аутентификации API ключа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Middleware для проверки прав API
function requireApiPermission(...permissions) {
  return (req, res, next) => {
    if (!req.apiPermissions) {
      return res.status(403).json({ error: 'Нет прав API' });
    }

    const hasPermission = permissions.some(p => req.apiPermissions.includes(p));
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Недостаточно прав API' });
    }

    next();
  };
}

// Middleware для логирования API запросов
async function logApiRequest(req, res, next) {
  const startTime = Date.now();
  
  // Перехватываем ответ для логирования
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Асинхронное логирование
    setImmediate(async () => {
      try {
        const { v4: uuidv4 } = require('uuid');
        await db.query(
          `INSERT INTO api_logs (id, api_key_id, method, endpoint, status_code, request_body, response_body, ip_address, user_agent, duration_ms)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            req.apiKeyId || null,
            req.method,
            req.originalUrl,
            res.statusCode,
            req.body ? JSON.stringify(req.body).substring(0, 1000) : null,
            typeof data === 'string' ? data.substring(0, 1000) : null,
            req.ip,
            req.get('user-agent'),
            duration
          ]
        );
      } catch (error) {
        console.error('Ошибка логирования API:', error);
      }
    });
    
    originalSend.call(this, data);
  };
  
  next();
}

module.exports = {
  apiKeyAuth,
  requireApiPermission,
  logApiRequest
};
