#!/bin/bash

# ============================================
# Скрипт автоматического деплоя
# ============================================
# Использование: ./deploy.sh [environment]
# Примеры:
#   ./deploy.sh          - деплой на продакшен
#   ./deploy.sh staging  - деплой на staging
#   ./deploy.sh dev      - деплой на dev

set -e  # Остановка при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для вывода
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Получение окружения
ENVIRONMENT=${1:-production}

info "Начинаем деплой на окружение: $ENVIRONMENT"

# Проверка зависимостей
info "Проверяем зависимости..."

if ! command -v node &> /dev/null; then
    error "Node.js не установлен. Установите Node.js 18+"
fi

if ! command -v npm &> /dev/null; then
    error "npm не установлен"
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Требуется Node.js версии 18 или выше. Текущая версия: $(node -v)"
fi

success "Node.js $(node -v) установлен"

# Установка зависимостей
info "Устанавливаем зависимости..."
npm ci --only=production
success "Зависимости установлены"

# Сборка проекта
info "Собираем проект..."
npm run build
success "Проект собран"

# Проверка наличия dist
if [ ! -d "dist" ]; then
    error "Папка dist не найдена после сборки"
fi

success "Папка dist создана: $(du -sh dist | cut -f1)"

# Деплой в зависимости от окружения
case $ENVIRONMENT in
    production)
        DEPLOY_PATH="/var/www/project-office"
        NGINX_CONFIG="/etc/nginx/sites-available/project-office"
        ;;
    staging)
        DEPLOY_PATH="/var/www/project-office-staging"
        NGINX_CONFIG="/etc/nginx/sites-available/project-office-staging"
        ;;
    dev)
        DEPLOY_PATH="/var/www/project-office-dev"
        NGINX_CONFIG="/etc/nginx/sites-available/project-office-dev"
        ;;
    *)
        error "Неизвестное окружение: $ENVIRONMENT. Используйте: production, staging, dev"
        ;;
esac

# Создание директории для деплоя
info "Создаём директорию для деплоя: $DEPLOY_PATH"
sudo mkdir -p $DEPLOY_PATH

# Очистка старой версии
info "Очищаем старую версию..."
sudo rm -rf $DEPLOY_PATH/*

# Копирование новых файлов
info "Копируем новые файлы..."
sudo cp -r dist/* $DEPLOY_PATH/

# Установка прав
info "Устанавливаем права доступа..."
sudo chown -R www-data:www-data $DEPLOY_PATH
sudo chmod -R 755 $DEPLOY_PATH

# Проверка конфигурации Nginx
if [ -f "$NGINX_CONFIG" ]; then
    info "Проверяем конфигурацию Nginx..."
    sudo nginx -t || error "Ошибка в конфигурации Nginx"
    
    # Перезагрузка Nginx
    info "Перезагружаем Nginx..."
    sudo systemctl reload nginx
    success "Nginx перезапущен"
else
    warning "Конфигурация Nginx не найдена: $NGINX_CONFIG"
    warning "Пропускаем перезагрузку Nginx"
fi

# Проверка доступности
info "Проверяем доступность сайта..."
sleep 2

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    success "Сайт доступен (HTTP $HTTP_CODE)"
else
    warning "Сайт вернул код: $HTTP_CODE"
    warning "Проверьте логи: sudo tail -f /var/log/nginx/error.log"
fi

# Вывод информации
echo ""
success "=========================================="
success "Деплой завершён успешно!"
success "=========================================="
echo ""
info "Окружение: $ENVIRONMENT"
info "Путь: $DEPLOY_PATH"
info "Размер: $(du -sh $DEPLOY_PATH | cut -f1)"
echo ""
info "Полезные команды:"
echo "  - Логи Nginx: sudo tail -f /var/log/nginx/error.log"
echo "  - Статус Nginx: sudo systemctl status nginx"
echo "  - Перезагрузка Nginx: sudo systemctl reload nginx"
echo ""
