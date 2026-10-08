const jwt = require('jsonwebtoken');
const db = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Middleware для аутентификации
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Требуется аутентификация' });
    }

    const token = authHeader.substring(7);
    
    // Проверка токена
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Проверка сессии в БД
    const sessions = await db.query(
      'SELECT * FROM sessions WHERE token = ? AND expires_at > NOW()',
      [token]
    );
    
    if (sessions.length === 0) {
      return res.status(401).json({ error: 'Сессия истекла' });
    }

    // Получение пользователя
    const users = await db.query(
      'SELECT id, login, name, email, role, office_id, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0 || !users[0].is_active) {
      return res.status(401).json({ error: 'Пользователь не найден или заблокирован' });
    }

    // Добавление пользователя в request
    req.user = users[0];
    req.token = token;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Токен истёк' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Недействительный токен' });
    }
    console.error('Ошибка аутентификации:', error);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Middleware для проверки ролей
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Требуется аутентификация' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }

    next();
  };
}

// Middleware для проверки доступа к проекту
async function checkProjectAccess(req, res, next) {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    
    if (!projectId) {
      return next();
    }

    // Администраторы имеют доступ ко всем проектам
    if (req.user.role === 'admin') {
      return next();
    }

    // Руководители офисов имеют доступ к проектам своего офиса
    if (req.user.role === 'office_director') {
      const projects = await db.query(
        'SELECT id FROM projects WHERE id = ? AND office_id = ?',
        [projectId, req.user.office_id]
      );
      
      if (projects.length > 0) {
        return next();
      }
    }

    // Руководители проектов и участники имеют доступ к назначенным проектам
    if (['project_manager', 'team_member'].includes(req.user.role)) {
      const userProjects = await db.query(
        'SELECT project_id FROM user_projects WHERE user_id = ? AND project_id = ?',
        [req.user.id, projectId]
      );
      
      if (userProjects.length > 0) {
        return next();
      }
    }

    // Наблюдатели имеют доступ на чтение ко всем проектам
    if (req.user.role === 'viewer' && req.method === 'GET') {
      return next();
    }

    return res.status(403).json({ error: 'Нет доступа к этому проекту' });
  } catch (error) {
    console.error('Ошибка проверки доступа:', error);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
}

// Генерация JWT токена
function generateToken(user) {
  return jwt.sign(
    { 
      userId: user.id,
      role: user.role,
      officeId: user.office_id
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

module.exports = {
  authenticate,
  authorize,
  checkProjectAccess,
  generateToken,
  JWT_SECRET
};
