@echo off
chcp 65001 >nul
echo ============================================
echo Установка платформы проектных офисов для XAMPP
echo ============================================
echo.

:: Проверка XAMPP
if not exist "C:\xampp\apache\bin\httpd.exe" (
    echo [ОШИБКА] XAMPP не найден в C:\xampp
    echo Установите XAMPP с https://www.apachefriends.org/
    pause
    exit /b 1
)

echo [1/7] Проверка зависимостей...

:: Проверка Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ОШИБКА] Node.js не установлен
    echo Установите Node.js с https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js найден
echo [OK] XAMPP найден

echo.
echo [2/7] Создание базы данных...

:: Создание базы данных через MySQL
"C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS project_office_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось создать базу данных
    echo Убедитесь, что MySQL запущен в XAMPP
    pause
    exit /b 1
)

echo [OK] База данных создана

echo.
echo [3/7] Импорт схемы базы данных...

:: Импорт схемы
"C:\xampp\mysql\bin\mysql.exe" -u root project_office_db < "server\database\schema.sql"

if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось импортировать схему
    pause
    exit /b 1
)

echo [OK] Схема импортирована

echo.
echo [4/7] Установка зависимостей backend...

cd server
call npm install

if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось установить зависимости backend
    pause
    exit /b 1
)

echo [OK] Зависимости backend установлены

echo.
echo [5/7] Создание файла .env...

:: Создание .env файла
(
echo # Сервер
echo PORT=3001
echo NODE_ENV=development
echo FRONTEND_URL=http://localhost
echo.
echo # MySQL ^(^XAMPP^)
echo DB_HOST=localhost
echo DB_PORT=3306
echo DB_USER=root
echo DB_PASSWORD=
echo DB_NAME=project_office_db
echo.
echo # JWT
echo JWT_SECRET=change-this-to-a-very-long-random-string-in-production-min-256-bits
echo JWT_EXPIRES_IN=24h
echo.
echo # Безопасность
echo MAX_LOGIN_ATTEMPTS=5
echo LOCKOUT_DURATION=900
echo SESSION_TIMEOUT=86400
) > .env

echo [OK] Файл .env создан

echo.
echo [6/7] Заполнение базы данных...

call npm run seed

if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось заполнить базу данных
    pause
    exit /b 1
)

echo [OK] База данных заполнена

cd ..

echo.
echo [7/7] Установка зависимостей frontend...

call npm install

if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось установить зависимости frontend
    pause
    exit /b 1
)

echo [OK] Зависимости frontend установлены

echo.
echo ============================================
echo Установка завершена успешно!
echo ============================================
echo.
echo Следующие шаги:
echo 1. Запустите start-xampp.bat для запуска системы
echo 2. Откройте http://localhost/project-office/
echo 3. Войдите с логином: admin / admin123
echo.
echo Для получения подробной информации см. XAMPP_DEPLOY.md
echo.
pause
