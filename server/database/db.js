const mysql = require('mysql2/promise');

// Конфигурация подключения к MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'project_office_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Безопасность: отключаем множественные запросы для предотвращения SQL injection
  multipleStatements: false,
  // Таймауты
  connectTimeout: 10000,
  idleTimeout: 60000,
};

// Создание пула соединений
const pool = mysql.createPool(dbConfig);

// Тестирование подключения
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Подключение к MySQL установлено');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Ошибка подключения к MySQL:', error.message);
    return false;
  }
}

// Экспорт пула и вспомогательных функций
module.exports = {
  pool,
  testConnection,
  
  // Вспомогательная функция для выполнения запросов с логированием
  async query(sql, params = []) {
    const start = Date.now();
    try {
      const [results] = await pool.execute(sql, params);
      const duration = Date.now() - start;
      
      // Логирование медленных запросов
      if (duration > 1000) {
        console.warn(`⚠️ Медленный запрос (${duration}ms):`, sql.substring(0, 100));
      }
      
      return results;
    } catch (error) {
      console.error('❌ Ошибка выполнения запроса:', error.message);
      throw error;
    }
  },
  
  // Транзакции
  async transaction(callback) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};
