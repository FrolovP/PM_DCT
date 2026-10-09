@echo off
chcp 65001 >nul
echo ============================================
echo Запуск платформы проектных офисов
echo ============================================
echo.

echo [1/3] Проверка XAMPP...

:: Проверка, запущен ли Apache
tasklist /FI "IMAGENAME eq httpd.exe" 2>NUL | find /I /N "httpd.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] Apache запущен
) else (
    echo [!] Apache не запущен. Запустите XAMPP Control Panel и включите Apache
    echo.
    echo Откройте C:\xampp\xampp-control.exe
    pause
    exit /b 1
)

:: Проверка, запущен ли MySQL
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MySQL запущен
) else (
    echo [!] MySQL не запущен. Запустите XAMPP Control Panel и включите MySQL
    echo.
    echo Откройте C:\xampp\xampp-control.exe
    pause
    exit /b 1
)

echo.
echo [2/3] Сборка frontend...

call npm run build

if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось собрать frontend
    pause
    exit /b 1
)

echo [OK] Frontend собран

echo.
echo [3/3] Копирование файлов в XAMPP...

:: Создание директории
if not exist "C:\xampp\htdocs\project-office" mkdir "C:\xampp\htdocs\project-office"

:: Копирование файлов
xcopy /E /I /Y "dist\*" "C:\xampp\htdocs\project-office\" >nul

if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось скопировать файлы
    echo Попробуйте запустить скрипт от имени администратора
    pause
    exit /b 1
)

echo [OK] Файлы скопированы

echo.
echo [4/4] Запуск backend сервера...

:: Запуск backend в отдельном окне
start "Backend Server - Проектный офис" cmd /k "cd server && npm run dev"

:: Ожидание запуска backend
echo Ожидание запуска backend...
timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo Система запущена!
echo ============================================
echo.
echo Frontend: http://localhost/project-office/
echo Backend:  http://localhost:3001
echo.
echo Демо-пользователи:
echo   admin / admin123      - Администратор
echo   director / director123 - Руководитель офиса
echo   pm / pm123            - Руководитель проекта
echo   member / member123    - Участник
echo   viewer / viewer123    - Наблюдатель
echo.
echo Нажмите любую клавишу для открытия браузера...
pause >nul

:: Открытие браузера
start http://localhost/project-office/

echo.
echo Для остановки системы:
echo 1. Закройте окно "Backend Server"
echo 2. Остановите Apache и MySQL в XAMPP Control Panel
echo.
pause
