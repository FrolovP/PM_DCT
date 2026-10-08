# 🚀 Быстрый старт деплоя

Этот документ содержит краткую инструкцию для быстрого развёртывания проекта.

## ⚡ Самый быстрый способ (Docker)

```bash
# 1. Клонируйте проект
git clone <repository-url>
cd project-office-platform

# 2. Запустите Docker Compose
docker-compose up -d

# 3. Готово! Откройте http://localhost
```

## 📦 Альтернативные способы

### Nginx (без Docker)

```bash
# 1. Установите зависимости и соберите
npm install
npm run build

# 2. Скопируйте файлы
sudo mkdir -p /var/www/project-office
sudo cp -r dist/* /var/www/project-office/
sudo chown -R www-data:www-data /var/www/project-office

# 3. Настройте Nginx (используйте nginx.conf из проекта)
sudo cp nginx.conf /etc/nginx/sites-available/project-office
sudo ln -s /etc/nginx/sites-available/project-office /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 4. Готово! Откройте http://your-server-ip
```

### Автоматический деплой

```bash
# Используйте скрипт автоматического деплоя
chmod +x deploy.sh
./deploy.sh production
```

## 🔐 Демо-пользователи

| Логин | Пароль | Роль |
|-------|--------|------|
| admin | admin123 | Администратор |
| director | director123 | Руководитель офиса |
| pm | pm123 | Руководитель проекта |
| member | member123 | Участник |
| viewer | viewer123 | Наблюдатель |

## 📚 Полная документация

Подробная инструкция по деплою: [DEPLOY.md](./DEPLOY.md)

## 🛠️ Полезные команды

```bash
# Сборка проекта
npm run build

# Запуск в режиме разработки
npm run dev

# Docker: запуск
docker-compose up -d

# Docker: остановка
docker-compose down

# Docker: логи
docker-compose logs -f

# Бэкап
./backup.sh

# Восстановление
./restore.sh /backup/project-office/backup-file.tar.gz
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `docker-compose logs` или `sudo tail -f /var/log/nginx/error.log`
2. Проверьте конфигурацию: `sudo nginx -t`
3. Проверьте права доступа к файлам
4. Очистите кэш браузера (Ctrl+Shift+R)

---

**Версия**: 1.0  
**Обновлено**: 2025
