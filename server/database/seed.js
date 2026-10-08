require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  console.log('🌱 Начинаем заполнение базы данных...');

  try {
    // Проверка подключения
    await db.testConnection();

    // Создание администратора
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminId = uuidv4();
    
    await db.query(
      `INSERT INTO users (id, login, password_hash, name, email, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [adminId, 'admin', adminPassword, 'Системный администратор', 'admin@company.ru', 'admin']
    );
    console.log('✅ Создан администратор: admin / admin123');

    // Создание директоров офисов
    const offices = [
      { name: 'ИТ-дирекция', icon: '💻', color: '#4f46e5', director: 'Иванов А.С.', login: 'director', password: 'director123' },
      { name: 'Офис цифровой трансформации', icon: '🚀', color: '#059669', director: 'Петрова М.В.', login: 'director2', password: 'director123' },
      { name: 'Офис безопасности', icon: '🛡️', color: '#dc2626', director: 'Сидоров К.П.', login: 'director3', password: 'director123' }
    ];

    for (const office of offices) {
      const officeId = uuidv4();
      const passwordHash = await bcrypt.hash(office.password, 10);
      const userId = uuidv4();

      // Создание офиса
      await db.query(
        `INSERT INTO project_offices (id, name, description, color, icon, director) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [officeId, office.name, `Офис: ${office.name}`, office.color, office.icon, office.director]
      );

      // Создание пользователя-директора
      await db.query(
        `INSERT INTO users (id, login, password_hash, name, email, role, office_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, office.login, passwordHash, office.director, `${office.login}@company.ru`, 'office_director', officeId]
      );

      console.log(`✅ Создан офис: ${office.name} (${office.login} / ${office.password})`);
    }

    // Создание дополнительных пользователей
    const users = [
      { login: 'pm', password: 'pm123', name: 'Козлов Д.И.', role: 'project_manager', email: 'kozlov@company.ru' },
      { login: 'member', password: 'member123', name: 'Волков Р.Н.', role: 'team_member', email: 'volkov@company.ru' },
      { login: 'viewer', password: 'viewer123', name: 'Гость', role: 'viewer', email: 'guest@company.ru' }
    ];

    for (const user of users) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      const userId = uuidv4();

      await db.query(
        `INSERT INTO users (id, login, password_hash, name, email, role) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, user.login, passwordHash, user.name, user.email, user.role]
      );

      console.log(`✅ Создан пользователь: ${user.name} (${user.login} / ${user.password})`);
    }

    console.log('\n🎉 База данных успешно заполнена!');
    console.log('\n📋 Демо-пользователи:');
    console.log('  - admin / admin123 (Администратор)');
    console.log('  - director / director123 (Директор ИТ-дирекции)');
    console.log('  - pm / pm123 (Руководитель проекта)');
    console.log('  - member / member123 (Участник)');
    console.log('  - viewer / viewer123 (Наблюдатель)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка заполнения базы данных:', error);
    process.exit(1);
  }
}

seed();
