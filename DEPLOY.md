# Инструкция по размещению на сервере

Полное руководство по деплою платформы проектных офисов на продакшен-сервер.

## 📋 Содержание

1. [Требования](#требования)
2. [Сборка проекта](#сборка-проекта)
3. [Вариант 1: Nginx (рекомендуется)](#вариант-1-nginx-рекомендуется)
4. [Вариант 2: Docker](#вариант-2-docker)
5. [Вариант 3: Docker Compose](#вариант-3-docker-compose)
6. [Вариант 4: Apache](#вариант-4-apache)
7. [Вариант 5: Облачные платформы](#вариант-5-облачные-платформы)
8. [Настройка HTTPS](#настройка-https)
9. [Обновление приложения](#обновление-приложения)
10. [Резервное копирование](#резервное-копирование)
11. [Мониторинг](#мониторинг)
12. [Troubleshooting](#troubleshooting)

---

## Требования

### Минимальные требования к серверу:
- **CPU**: 1 ядро
- **RAM**: 512 MB
- **Диск**: 1 GB свободного места
- **ОС**: Linux (Ubuntu 20.04+, CentOS 7+, Debian 10+)
- **Сеть**: Открытые порты 80 (HTTP) и 443 (HTTPS)

### Программное обеспечение:
- **Node.js** 18+ (для сборки)
- **Nginx** или **Apache** (для продакшена)
- **Docker** (опционально, для контейнеризации)

---

## Сборка проекта

### 1. Клонирование репозитория

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd project-office-platform

# Или скопируйте файлы проекта на сервер
scp -r ./project-office user@server:/var/www/
```

### 2. Установка зависимостей

```bash
# Установите Node.js 18+ (если ещё не установлен)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Проверьте версию
node --version  # Должна быть 18+
npm --version

# Установите зависимости
npm install
```

### 3. Сборка для продакшена

```bash
# Создайте оптимизированную сборку
npm run build

# Результат будет в папке dist/
ls -la dist/
```

**Важно**: Папка `dist/` содержит все необходимые файлы для продакшена. Её нужно разместить на веб-сервере.

---

## Вариант 1: Nginx (рекомендуется)

### 1. Установка Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install epel-release
sudo yum install nginx

# Запустите и добавьте в автозагрузку
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. Копирование файлов

```bash
# Создайте директорию для сайта
sudo mkdir -p /var/www/project-office

# Скопируйте собранные файлы
sudo cp -r dist/* /var/www/project-office/

# Установите правильные права
sudo chown -R www-data:www-data /var/www/project-office
sudo chmod -R 755 /var/www/project-office
```

### 3. Конфигурация Nginx

Создайте конфигурационный файл:

```bash
sudo nano /etc/nginx/sites-available/project-office
```

Скопируйте содержимое из файла `nginx.conf` (уже включён в проект) или используйте этот шаблон:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Замените на ваш домен или IP
    
    root /var/www/project-office;
    index index.html;
    
    # Кэширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA routing - все запросы перенаправляем на index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Сжатие gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;
    
    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Логирование
    access_log /var/log/nginx/project-office-access.log;
    error_log /var/log/nginx/project-office-error.log;
}
```

### 4. Активация конфигурации

```bash
# Создайте символическую ссылку
sudo ln -s /etc/nginx/sites-available/project-office /etc/nginx/sites-enabled/

# Проверьте конфигурацию
sudo nginx -t

# Перезагрузите Nginx
sudo systemctl reload nginx
```

### 5. Настройка файрвола

```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 'Nginx Full'
sudo ufw status

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

**Готово!** Откройте браузер и перейдите по адресу `http://your-server-ip` или `http://your-domain.com`

---

## Вариант 2: Docker

### 1. Установка Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Проверка
docker --version
```

### 2. Сборка Docker-образа

В проекте уже есть `Dockerfile`. Соберите образ:

```bash
# Соберите образ
docker build -t project-office:latest .

# Проверьте образ
docker images | grep project-office
```

### 3. Запуск контейнера

```bash
# Запустите контейнер
docker run -d \
  --name project-office \
  -p 80:80 \
  --restart unless-stopped \
  project-office:latest

# Проверьте статус
docker ps

# Просмотр логов
docker logs -f project-office
```

### 4. Управление контейнером

```bash
# Остановить
docker stop project-office

# Запустить снова
docker start project-office

# Перезапустить
docker restart project-office

# Удалить контейнер
docker rm -f project-office

# Удалить образ
docker rmi project-office:latest
```

---

## Вариант 3: Docker Compose

### 1. Установка Docker Compose

```bash
# Docker Compose уже включён в Docker Desktop
# Или установите отдельно:
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Запуск с Docker Compose

В проекте есть файл `docker-compose.yml`:

```bash
# Запуск в фоновом режиме
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Пересборка и запуск
docker-compose up -d --build
```

### 3. Обновление через Docker Compose

```bash
# Остановите старый контейнер
docker-compose down

# Соберите новый образ
docker-compose build

# Запустите
docker-compose up -d
```

---

## Вариант 4: Apache

### 1. Установка Apache

```bash
# Ubuntu/Debian
sudo apt install apache2

# CentOS/RHEL
sudo yum install httpd

# Запустите
sudo systemctl start apache2
sudo systemctl enable apache2
```

### 2. Копирование файлов

```bash
sudo mkdir -p /var/www/html/project-office
sudo cp -r dist/* /var/www/html/project-office/
sudo chown -R www-data:www-data /var/www/html/project-office  # Ubuntu/Debian
# или
sudo chown -R apache:apache /var/www/html/project-office  # CentOS/RHEL
```

### 3. Конфигурация Apache

Создайте файл `.htaccess` в папке `/var/www/html/project-office/`:

```apache
RewriteEngine On
RewriteBase /

# Перенаправление всех запросов на index.html (SPA)
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Кэширование
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

Включите модуль rewrite:

```bash
sudo a2enmod rewrite  # Ubuntu/Debian
sudo systemctl restart apache2
```

---

## Вариант 5: Облачные платформы

### Vercel (рекомендуется для быстрого деплоя)

```bash
# Установите Vercel CLI
npm install -g vercel

# Войдите в аккаунт
vercel login

# Задеплойте проект
vercel

# Для продакшена
vercel --prod
```

### Netlify

```bash
# Установите Netlify CLI
npm install -g netlify-cli

# Войдите в аккаунт
netlify login

# Задеплойте
netlify deploy --prod --dir=dist
```

### GitHub Pages

```bash
# Установите gh-pages
npm install -D gh-pages

# Добавьте в package.json:
# "deploy": "npm run build && gh-pages -d dist"

# Задеплойте
npm run deploy
```

---

## Настройка HTTPS

### С Let's Encrypt (бесплатно)

```bash
# Установите Certbot
sudo apt install certbot python3-certbot-nginx  # Для Nginx
# или
sudo apt install certbot python3-certbot-apache  # Для Apache

# Получите сертификат
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Certbot автоматически настроит Nginx и добавит автообновление

# Проверьте автообновление
sudo certbot renew --dry-run
```

### Ручная настройка HTTPS в Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Остальная конфигурация как выше
    root /var/www/project-office;
    index index.html;
    
    # ... (остальное из nginx.conf)
}

# Перенаправление с HTTP на HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Обновление приложения

### Ручное обновление

```bash
# 1. Остановите сервис (если используете Docker)
docker stop project-office

# 2. Перейдите в директорию проекта
cd /path/to/project

# 3. Получите обновления
git pull

# 4. Установите новые зависимости (если были изменения)
npm install

# 5. Соберите новую версию
npm run build

# 6. Скопируйте файлы
sudo cp -r dist/* /var/www/project-office/

# 7. Перезапустите сервис
sudo systemctl reload nginx  # Для Nginx
# или
docker start project-office  # Для Docker
```

### Автоматическое обновление (CI/CD)

Создайте скрипт `deploy.sh`:

```bash
#!/bin/bash

set -e

echo "🚀 Начинаем деплой..."

# Переход в директорию проекта
cd /var/www/project-office-source

# Получение последних изменений
git pull origin main

# Установка зависимостей
npm install

# Сборка
npm run build

# Копирование файлов
sudo rm -rf /var/www/project-office/*
sudo cp -r dist/* /var/www/project-office/

# Перезагрузка Nginx
sudo systemctl reload nginx

echo "✅ Деплой завершён успешно!"
```

Сделайте скрипт исполняемым:

```bash
chmod +x deploy.sh
```

Запускайте при каждом обновлении:

```bash
./deploy.sh
```

---

## Резервное копирование

### Что нужно сохранять

**Важно**: Все данные пользователей хранятся в `localStorage` браузера клиента, а не на сервере. Сервер хранит только статические файлы.

Если вы хотите сохранять данные на сервере, необходимо:

1. **Вариант A**: Настроить backend с базой данных (PostgreSQL, MySQL)
2. **Вариант B**: Использовать синхронизацию localStorage с сервером

### Бэкап конфигурации

```bash
#!/bin/bash

BACKUP_DIR="/backup/project-office"
DATE=$(date +%Y%m%d_%H%M%S)

# Создайте директорию для бэкапов
sudo mkdir -p $BACKUP_DIR

# Бэкап конфигурации Nginx
sudo tar -czf $BACKUP_DIR/nginx_config_$DATE.tar.gz /etc/nginx/sites-available/project-office

# Бэкап SSL сертификатов (если есть)
sudo tar -czf $BACKUP_DIR/ssl_certs_$DATE.tar.gz /etc/letsencrypt/

# Бэкап статических файлов
sudo tar -czf $BACKUP_DIR/www_files_$DATE.tar.gz /var/www/project-office/

echo "✅ Бэкап создан: $BACKUP_DIR"

# Удаление старых бэкапов (старше 30 дней)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

Добавьте в cron для автоматического выполнения:

```bash
# Откройте crontab
crontab -e

# Добавьте строку для ежедневного бэкапа в 2:00
0 2 * * * /path/to/backup.sh
```

---

## Мониторинг

### Проверка статуса Nginx

```bash
# Статус сервиса
sudo systemctl status nginx

# Просмотр логов в реальном времени
sudo tail -f /var/log/nginx/project-office-access.log
sudo tail -f /var/log/nginx/project-office-error.log

# Статистика подключений
sudo netstat -tulpn | grep nginx
```

### Проверка статуса Docker

```bash
# Статус контейнеров
docker ps

# Логи контейнера
docker logs -f project-office

# Использование ресурсов
docker stats project-office
```

### Мониторинг доступности

Создайте простой скрипт проверки:

```bash
#!/bin/bash

URL="http://your-domain.com"
EMAIL="admin@your-domain.com"

HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" $URL)

if [ $HTTP_CODE -ne 200 ]; then
    echo "⚠️ Сайт недоступен! HTTP код: $HTTP_CODE" | mail -s "Alert: Site Down" $EMAIL
fi
```

Добавьте в cron для проверки каждые 5 минут:

```bash
*/5 * * * * /path/to/health-check.sh
```

---

## Troubleshooting

### Проблема: Сайт не открывается

**Решение:**

```bash
# 1. Проверьте статус Nginx
sudo systemctl status nginx

# 2. Проверьте конфигурацию
sudo nginx -t

# 3. Проверьте логи
sudo tail -50 /var/log/nginx/error.log

# 4. Проверьте файрвол
sudo ufw status

# 5. Проверьте, слушает ли Nginx порт 80
sudo netstat -tulpn | grep :80
```

### Проблема: Белый экран после деплоя

**Решение:**

```bash
# 1. Проверьте, что файлы скопированы
ls -la /var/www/project-office/

# 2. Проверьте права доступа
sudo chown -R www-data:www-data /var/www/project-office
sudo chmod -R 755 /var/www/project-office

# 3. Проверьте конфигурацию Nginx (должна быть строка try_files)
cat /etc/nginx/sites-available/project-office | grep try_files

# 4. Перезагрузите Nginx
sudo systemctl reload nginx

# 5. Очистите кэш браузера (Ctrl+Shift+R)
```

### Проблема: Docker контейнер не запускается

**Решение:**

```bash
# 1. Проверьте логи
docker logs project-office

# 2. Проверьте, не занят ли порт 80
sudo lsof -i :80

# 3. Остановите конфликтующий сервис
sudo systemctl stop apache2  # Если работает Apache

# 4. Пересоберите образ
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Проблема: Не применяются изменения после обновления

**Решение:**

```bash
# 1. Пересоберите проект
npm run build

# 2. Скопируйте новые файлы
sudo cp -r dist/* /var/www/project-office/

# 3. Перезагрузите Nginx
sudo systemctl reload nginx

# 4. Очистите кэш браузера
# Ctrl+Shift+R (жёсткая перезагрузка)

# 5. Для Docker:
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Проблема: Ошибка 403 Forbidden

**Решение:**

```bash
# Проверьте права доступа
sudo chown -R www-data:www-data /var/www/project-office
sudo chmod -R 755 /var/www/project-office

# Проверьте, что index.html существует
ls -la /var/www/project-office/index.html
```

### Проблема: Ошибка 502 Bad Gateway

**Решение:**

```bash
# Эта ошибка обычно означает проблему с backend
# Для статического сайта проверьте:

# 1. Конфигурацию Nginx
sudo nginx -t

# 2. Логи
sudo tail -50 /var/log/nginx/error.log

# 3. Убедитесь, что нет proxy_pass на несуществующий backend
```

---

## Полезные команды

### Nginx

```bash
# Перезагрузка конфигурации
sudo systemctl reload nginx

# Полный рестарт
sudo systemctl restart nginx

# Проверка конфигурации
sudo nginx -t

# Просмотр статусов
sudo systemctl status nginx
```

### Docker

```bash
# Список контейнеров
docker ps -a

# Очистка неиспользуемых образов
docker image prune -a

# Очистка остановленных контейнеров
docker container prune

# Просмотр использования диска
docker system df
```

### Система

```bash
# Использование диска
df -h

# Использование памяти
free -h

# Загрузка CPU
top

# Активные соединения
netstat -tulpn
```

---

## Поддержка

Если у вас возникли проблемы:

1. Проверьте логи: `sudo tail -f /var/log/nginx/error.log`
2. Проверьте конфигурацию: `sudo nginx -t`
3. Проверьте права доступа к файлам
4. Убедитесь, что файрвол не блокирует порты
5. Очистите кэш браузера

---

## Дополнительные ресурсы

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

**Версия документа**: 1.0  
**Дата обновления**: 2025
