# 🖥️ Развертывание на XAMPP

Полное руководство по развертыванию платформы проектных офисов на локальном сервере XAMPP.

## 📋 Содержание

1. [Требования](#требования)
2. [Установка XAMPP](#установка-xampp)
3. [Настройка MySQL](#настройка-mysql)
4. [Настройка backend](#настройка-backend)
5. [Настройка frontend](#настройка-frontend)
6. [Настройка Apache](#настройка-apache)
7. [Запуск системы](#запуск-системы)
8. [Troubleshooting](#troubleshooting)

---

## Требования

### Программное обеспечение
- **XAMPP** 8.0+ (с Apache и MySQL)
- **Node.js** 18+ и npm
- **Git** (опционально)

### Системные требования
- **ОС**: Windows 10/11, macOS, Linux
- **RAM**: минимум 4 GB
- **Диск**: минимум 2 GB свободного места
- **Порты**: 80 (Apache), 3306 (MySQL), 3001 (backend API)

---

## Установка XAMPP

### 1. Скачивание XAMPP

1. Перейдите на [официальный сайт XAMPP](https://www.apachefriends.org/download.html)
2. Скачайте версию для вашей ОС:
   - **Windows**: `xampp-windows-x64-8.x.x.exe`
   - **macOS**: `xampp-osx-8.x.x.dmg`
   - **Linux**: `xampp-linux-x64-8.x.x.run`

### 2. Установка XAMPP

#### Windows
1. Запустите установщик
2. Выберите компоненты:
   - ✅ Apache
   - ✅ MySQL
   - ✅ PHP (для phpMyAdmin)
   - ❌ FileZilla FTP Server (не нужен)
   - ❌ Mercury Mail Server (не нужен)
   - ❌ Tomcat (не нужен)
3. Выберите путь установки (по умолчанию: `C:\xampp`)
4. Завершите установку

#### macOS
1. Откройте DMG файл
2. Перетащите XAMPP в Applications
3. Запустите XAMPP из Applications

#### Linux
```bash
# Сделать файл исполняемым
chmod +x xampp-linux-x64-8.x.x.run

# Запустить установку
sudo ./xampp-linux-x64-8.x.x.run
```

### 3. Запуск XAMPP Control Panel

#### Windows
1. Откройте `C:\xampp\xampp-control.exe`
2. Запустите модули:
   - ✅ Apache (Start)
   - ✅ MySQL (Start)

#### macOS/Linux
```bash
# Запуск через терминал
sudo /Applications/XAMPP/xamppfiles/xampp start

# Или через GUI
sudo /Applications/XAMPP/xamppfiles/manager-osx.app
```

### 4. Проверка работы

Откройте браузер и перейдите:
- **Apache**: http://localhost
- **phpMyAdmin**: http://localhost/phpmyadmin

Если страницы открываются — XAMPP работает корректно.

---

## Настройка MySQL

### 1. Создание базы данных

#### Через phpMyAdmin
1. Откройте http://localhost/phpmyadmin
2. Войдите с логином `root` (пароль по умолчанию пустой)
3. Нажмите **"Создать базу данных"**
4. Введите название: `project_office_db`
5. Выберите кодировку: `utf8mb4_unicode_ci`
6. Нажмите **"Создать"**

#### Через командную строку
```bash
# Windows
cd C:\xampp\mysql\bin
mysql -u root

# macOS/Linux
sudo /Applications/XAMPP/xamppfiles/bin/mysql -u root
```

```sql
-- Создание базы данных
CREATE DATABASE project_office_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Создание пользователя (опционально, для безопасности)
CREATE USER 'project_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON project_office_db.* TO 'project_user'@'localhost';
FLUSH PRIVILEGES;

-- Выход
EXIT;
```

### 2. Импорт схемы базы данных

#### Через phpMyAdmin
1. Откройте http://localhost/phpmyadmin
2. Выберите базу данных `project_office_db`
3. Перейдите на вкладку **"Импорт"**
4. Нажмите **"Выберите файл"**
5. Выберите файл `server/database/schema.sql`
6. Нажмите **"Вперёд"**

#### Через командную строку
```bash
# Windows
cd C:\xampp\mysql\bin
mysql -u root project_office_db < "C:\path\to\project\server\database\schema.sql"

# macOS/Linux
sudo /Applications/XAMPP/xamppfiles/bin/mysql -u root project_office_db < /path/to/project/server/database/schema.sql
```

### 3. Проверка таблиц

```bash
mysql -u root -e "USE project_office_db; SHOW TABLES;"
```

Должны отобразиться все таблицы:
- users
- project_offices
- portfolios
- projects
- tasks
- documents
- artifacts
- и другие...

---

## Настройка backend

### 1. Переход в директорию backend

```bash
# Windows
cd C:\path\to\project\server

# macOS/Linux
cd /path/to/project/server
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Создание файла .env

Создайте файл `.env` в директории `server/`:

```env
# Сервер
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost

# MySQL (XAMPP)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=project_office_db

# JWT
JWT_SECRET=your-super-secret-key-change-in-production-min-256-bits
JWT_EXPIRES_IN=24h

# Безопасность
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900
SESSION_TIMEOUT=86400
```

**Важно**: 
- `DB_PASSWORD` оставьте пустым, если не устанавливали пароль для root в XAMPP
- `JWT_SECRET` измените на случайную строку (минимум 32 символа)

### 4. Генерация JWT секрета

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Скопируйте результат в `.env` как `JWT_SECRET`.

### 5. Заполнение базы данных начальными данными

```bash
npm run seed
```

Это создаст:
- Администратора (admin / admin123)
- 3 проектных офиса
- Тестовых пользователей

### 6. Запуск backend сервера

```bash
# Для разработки (с автоперезагрузкой)
npm run dev

# Для продакшена
npm start
```

Сервер запустится на `http://localhost:3001`

Проверка работы:
```bash
curl http://localhost:3001/api/health
```

Должен вернуться JSON:
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

---

## Настройка frontend

### 1. Переход в корневую директорию проекта

```bash
# Windows
cd C:\path\to\project

# macOS/Linux
cd /path/to/project
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Сборка frontend

```bash
npm run build
```

Результат будет в папке `dist/`.

### 4. Копирование файлов в XAMPP

#### Вариант A: Использование htdocs (рекомендуется)

```bash
# Windows
xcopy /E /I /Y dist\* C:\xampp\htdocs\project-office\

# macOS/Linux
sudo cp -r dist/* /Applications/XAMPP/xamppfiles/htdocs/project-office/
```

#### Вариант B: Создание символической ссылки

```bash
# Windows (от имени администратора)
mklink /D C:\xampp\htdocs\project-office C:\path\to\project\dist

# macOS/Linux
sudo ln -s /path/to/project/dist /Applications/XAMPP/xamppfiles/htdocs/project-office
```

### 5. Создание .htaccess для SPA

Создайте файл `.htaccess` в `C:\xampp\htdocs\project-office\`:

```apache
RewriteEngine On
RewriteBase /project-office/

# Перенаправление всех запросов на index.html (SPA)
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /project-office/index.html [L]

# Кэширование статических файлов
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Сжатие
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>
```

---

## Настройка Apache

### 1. Включение модуля rewrite

Откройте файл `C:\xampp\apache\conf\httpd.conf` (или `/Applications/XAMPP/xamppfiles/etc/httpd.conf` на macOS/Linux)

Найдите строку:
```apache
#LoadModule rewrite_module modules/mod_rewrite.so
```

Удалите `#` в начале:
```apache
LoadModule rewrite_module modules/mod_rewrite.so
```

### 2. Настройка виртуального хоста (опционально)

Откройте файл `C:\xampp\apache\conf\extra\httpd-vhosts.conf`

Добавьте в конец:

```apache
<VirtualHost *:80>
    ServerName project-office.local
    DocumentRoot "C:/xampp/htdocs/project-office"
    
    <Directory "C:/xampp/htdocs/project-office">
        Options Indexes FollowSymLinks Includes ExecCGI
        AllowOverride All
        Require all granted
        
        # Proxy для API запросов
        RewriteEngine On
        RewriteRule ^/api/(.*)$ http://localhost:3001/api/$1 [P,L]
    </Directory>
    
    # Логирование
    ErrorLog "logs/project-office-error.log"
    CustomLog "logs/project-office-access.log" common
</VirtualHost>
```

### 3. Настройка hosts файла

#### Windows
Откройте `C:\Windows\System32\drivers\etc\hosts` (от имени администратора)

Добавьте строку:
```
127.0.0.1 project-office.local
```

#### macOS/Linux
```bash
sudo nano /etc/hosts
```

Добавьте строку:
```
127.0.0.1 project-office.local
```

### 4. Настройка CORS в backend

Откройте `server/index.js` и убедитесь, что CORS настроен правильно:

```javascript
const corsOptions = {
  origin: ['http://localhost', 'http://project-office.local'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
};
app.use(cors(corsOptions));
```

### 5. Перезапуск Apache

#### XAMPP Control Panel
1. Остановите Apache (Stop)
2. Запустите Apache (Start)

#### Командная строка
```bash
# Windows
net stop Apache2.4
net start Apache2.4

# macOS/Linux
sudo /Applications/XAMPP/xamppfiles/xampp restartapache
```

---

## Запуск системы

### 1. Запуск XAMPP

Убедитесь, что запущены:
- ✅ Apache
- ✅ MySQL

### 2. Запуск backend

В отдельном терминале:
```bash
cd server
npm run dev
```

### 3. Доступ к приложению

Откройте браузер:

#### Вариант A: Через localhost
```
http://localhost/project-office/
```

#### Вариант B: Через виртуальный хост (если настроен)
```
http://project-office.local/
```

### 4. Вход в систему

Используйте демо-пользователей:

| Логин | Пароль | Роль |
|-------|--------|------|
| admin | admin123 | Администратор |
| director | director123 | Руководитель офиса |
| pm | pm123 | Руководитель проекта |
| member | member123 | Участник |
| viewer | viewer123 | Наблюдатель |

---

## Проверка работы

### 1. Frontend
- ✅ Открывается главная страница
- ✅ Можно войти в систему
- ✅ Отображаются проекты

### 2. Backend API
```bash
# Проверка health
curl http://localhost:3001/api/health

# Проверка авторизации
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"admin123"}'
```

### 3. MySQL
```bash
mysql -u root -e "USE project_office_db; SELECT COUNT(*) FROM users;"
```

Должно вернуть количество пользователей (минимум 5).

---

## Troubleshooting

### Проблема: Apache не запускается

**Решение:**
```bash
# Проверьте, не занят ли порт 80
netstat -ano | findstr :80

# Если занят, остановите Skype, IIS или другой веб-сервер
# Или измените порт Apache в httpd.conf:
# Listen 8080
```

### Проблема: MySQL не запускается

**Решение:**
```bash
# Проверьте, не занят ли порт 3306
netstat -ano | findstr :3306

# Остановите другой MySQL сервер
# Или измените порт в my.ini
```

### Проблема: Ошибка подключения к БД

**Решение:**
1. Проверьте `.env` файл:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=project_office_db
   ```

2. Проверьте, что MySQL запущен в XAMPP
3. Проверьте, что база данных создана

### Проблема: CORS ошибка в браузере

**Решение:**
1. Проверьте `FRONTEND_URL` в `.env`:
   ```env
   FRONTEND_URL=http://localhost
   ```

2. Проверьте CORS настройки в `server/index.js`

### Проблема: 404 при обращении к API

**Решение:**
1. Убедитесь, что backend запущен на порту 3001
2. Проверьте, что frontend обращается к правильному URL
3. Проверьте консоль браузера на ошибки

### Проблема: Белый экран после входа

**Решение:**
1. Очистите кэш браузера (Ctrl+Shift+R)
2. Проверьте консоль браузера на ошибки
3. Проверьте, что `.htaccess` создан правильно
4. Убедитесь, что модуль rewrite включен в Apache

### Проблема: Не сохраняются данные

**Решение:**
1. Проверьте подключение к MySQL
2. Проверьте логи backend:
   ```bash
   # В терминале, где запущен backend
   # Должны быть видны запросы к БД
   ```

3. Проверьте права пользователя MySQL:
   ```sql
   SHOW GRANTS FOR 'root'@'localhost';
   ```

---

## Автоматизация запуска

### Создание скрипта запуска (Windows)

Создайте файл `start.bat`:

```batch
@echo off
echo Запуск платформы проектных офисов...

:: Запуск XAMPP
echo Запуск XAMPP...
start "" "C:\xampp\xampp-control.exe"

:: Ожидание запуска MySQL
timeout /t 5 /nobreak >nul

:: Запуск backend
echo Запуск backend...
cd server
start "Backend Server" cmd /k "npm run dev"

:: Ожидание запуска backend
timeout /t 3 /nobreak >nul

:: Открытие браузера
echo Открытие браузера...
start http://localhost/project-office/

echo.
echo Платформа запущена!
echo Frontend: http://localhost/project-office/
echo Backend: http://localhost:3001
echo.
pause
```

### Создание скрипта остановки (Windows)

Создайте файл `stop.bat`:

```batch
@echo off
echo Остановка платформы...

:: Остановка backend
taskkill /FI "WINDOWTITLE eq Backend Server*"

:: Остановка XAMPP
"C:\xampp\apache\bin\httpd.exe" -k stop
"C:\xampp\mysql\bin\mysqladmin.exe" -u root shutdown

echo Платформа остановлена!
pause
```

---

## Обновление приложения

### Обновление frontend

```bash
# 1. Получите обновления
git pull

# 2. Установите зависимости (если были изменения)
npm install

# 3. Соберите новую версию
npm run build

# 4. Скопируйте файлы
xcopy /E /I /Y dist\* C:\xampp\htdocs\project-office\

# 5. Очистите кэш браузера (Ctrl+Shift+R)
```

### Обновление backend

```bash
# 1. Получите обновления
git pull

# 2. Установите зависимости
cd server
npm install

# 3. Перезапустите backend
npm run dev
```

---

## Резервное копирование

### Бэкап базы данных

```bash
# Windows
C:\xampp\mysql\bin\mysqldump -u root project_office_db > backup.sql

# macOS/Linux
sudo /Applications/XAMPP/xamppfiles/bin/mysqldump -u root project_office_db > backup.sql
```

### Восстановление из бэкапа

```bash
# Windows
C:\xampp\mysql\bin\mysql -u root project_office_db < backup.sql

# macOS/Linux
sudo /Applications/XAMPP/xamppfiles/bin/mysql -u root project_office_db < backup.sql
```

---

## Полезные команды

### XAMPP

```bash
# Запуск всех сервисов
# Windows: через xampp-control.exe
# macOS/Linux:
sudo /Applications/XAMPP/xamppfiles/xampp start

# Остановка всех сервисов
sudo /Applications/XAMPP/xamppfiles/xampp stop

# Перезапуск Apache
sudo /Applications/XAMPP/xamppfiles/xampp restartapache

# Перезапуск MySQL
sudo /Applications/XAMPP/xamppfiles/xampp restartmysql
```

### MySQL

```bash
# Вход в MySQL
mysql -u root

# Показать базы данных
SHOW DATABASES;

# Использовать базу данных
USE project_office_db;

# Показать таблицы
SHOW TABLES;

# Выйти
EXIT;
```

### Backend

```bash
# Запуск в режиме разработки
npm run dev

# Запуск в продакшене
npm start

# Заполнение БД начальными данными
npm run seed
```

---

## Безопасность

### Для локальной разработки
- ✅ Используйте пароль по умолчанию (пустой) для MySQL root
- ✅ Не меняйте JWT_SECRET на простой

### Для продакшена
- ❌ **НЕ ИСПОЛЬЗУЙТЕ XAMPP В ПРОДАКШЕНЕ!**
- ✅ Используйте отдельные серверы для Apache и MySQL
- ✅ Настройте HTTPS
- ✅ Установите сложные пароли
- ✅ Настройте firewall

---

## Поддержка

При возникновении проблем:
1. Проверьте логи Apache: `C:\xampp\apache\logs\error.log`
2. Проверьте логи MySQL: `C:\xampp\mysql\data\mysql_error.log`
3. Проверьте логи backend в терминале
4. Проверьте консоль браузера (F12)

---

**Версия**: 1.0  
**Обновлено**: 2025  
**XAMPP**: 8.0+  
**Node.js**: 18+
