// Глобальный обработчик ошибок
function errorHandler(err, req, res, next) {
  console.error('❌ Ошибка:', err);

  // Ошибки валидации
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Ошибка валидации',
      details: err.details
    });
  }

  // Ошибки MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Запись уже существует'
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      error: 'Связанная запись не найдена'
    });
  }

  // Ошибки JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Недействительный токен'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Токен истёк'
    });
  }

  // Стандартные HTTP ошибки
  if (err.status) {
    return res.status(err.status).json({
      error: err.message || 'Произошла ошибка'
    });
  }

  // Неизвестные ошибки
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Внутренняя ошибка сервера' 
    : err.message || 'Произошла ошибка';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}

// Обработчик 404
function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Маршрут не найден'
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
