require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

// Импорты маршрутов
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const officesRoutes = require('./routes/offices');
const portfoliosRoutes = require('./routes/portfolios');
const projectsRoutes = require('./routes/projects');
const tasksRoutes = require('./routes/tasks');
const documentsRoutes = require('./routes/documents');
const artifactsRoutes = require('./routes/artifacts');
const knowledgeRoutes = require('./routes/knowledge');
const settingsRoutes = require('./routes/settings');
const auditRoutes = require('./routes/audit');
const apiKeysRoutes = require('./routes/apiKeys');
const publicApiRoutes = require('./routes/publicApi');
const webhooksRoutes = require('./routes/webhooks');
const messengerRoutes = require('./routes/messenger');

// Импорты middleware
const { errorHandler } = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// Безопасность: HTTP заголовки
// ============================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ============================================
// Безопасность: CORS
// ============================================
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 часа
};
app.use(cors(corsOptions));

// ============================================
// Безопасность: Rate Limiting
// ============================================
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов
  message: { error: 'Слишком много запросов, попробуйте позже' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток входа
  message: { error: 'Слишком много попыток входа, попробуйте позже' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);

// ============================================
// Логирование
// ============================================
app.use(morgan('combined'));

// ============================================
// Сжатие ответов
// ============================================
app.use(compression());

// ============================================
// Парсинг тела запроса
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// Раздача статических файлов (frontend)
// ============================================
app.use(express.static(path.join(__dirname, '../dist')));

// ============================================
// API маршруты
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticate, usersRoutes);
app.use('/api/offices', authenticate, officesRoutes);
app.use('/api/portfolios', authenticate, portfoliosRoutes);
app.use('/api/projects', authenticate, projectsRoutes);
app.use('/api/tasks', authenticate, tasksRoutes);
app.use('/api/documents', authenticate, documentsRoutes);
app.use('/api/artifacts', authenticate, artifactsRoutes);
app.use('/api/knowledge', authenticate, knowledgeRoutes);
app.use('/api/settings', authenticate, settingsRoutes);
app.use('/api/audit', authenticate, auditRoutes);

// API ключи и интеграции
app.use('/api/api-keys', authenticate, apiKeysRoutes);
app.use('/api/webhooks', authenticate, webhooksRoutes);
app.use('/api/messenger', authenticate, messengerRoutes);

// Публичный API (доступен по API ключу)
app.use('/api/v1', publicApiRoutes);

// ============================================
// Health check
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ============================================
// Обработка 404 для API
// ============================================
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// ============================================
// SPA fallback - все остальные запросы на frontend
// ============================================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// ============================================
// Обработка ошибок
// ============================================
app.use(errorHandler);

// ============================================
// Запуск сервера
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📊 Режим: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});

// Обработка необработанных исключений
process.on('unhandledRejection', (err) => {
  console.error('❌ Необработанное отклонение Promise:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Необработанное исключение:', err);
  process.exit(1);
});

module.exports = app;
