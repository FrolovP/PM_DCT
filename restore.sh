#!/bin/bash

# ============================================
# Скрипт восстановления из бэкапа
# ============================================
# Использование: ./restore.sh <backup_file>
# Пример: ./restore.sh /backup/project-office/project-office-backup-20250101_120000.tar.gz

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

# Проверка аргументов
if [ -z "$1" ]; then
    error "Укажите путь к файлу бэкапа"
    echo "Использование: $0 <backup_file>"
    echo ""
    echo "Доступные бэкапы:"
    ls -lh /backup/project-office/*.tar.gz 2>/dev/null || echo "  Бэкапы не найдены"
    exit 1
fi

BACKUP_FILE=$1

# Проверка существования файла
if [ ! -f "$BACKUP_FILE" ]; then
    error "Файл бэкапа не найден: $BACKUP_FILE"
fi

# Подтверждение
warning "ВНИМАНИЕ: Восстановление перезапишет текущие данные!"
read -p "Продолжить? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    info "Восстановление отменено"
    exit 0
fi

# Создание временной директории
TEMP_DIR="/tmp/restore-$(date +%s)"
mkdir -p $TEMP_DIR

# Распаковка бэкапа
info "Распаковываем бэкап..."
sudo tar -xzf $BACKUP_FILE -C $TEMP_DIR
success "Бэкап распакован"

# Восстановление конфигурации Nginx
info "Восстанавливаем конфигурацию Nginx..."
if [ -f "$TEMP_DIR/*/nginx-config.tar.gz" ]; then
    sudo tar -xzf $TEMP_DIR/*/nginx-config.tar.gz -C /
    success "Конфигурация Nginx восстановлена"
else
    warning "Бэкап Nginx не найден, пропускаем"
fi

# Восстановление SSL сертификатов
info "Восстанавливаем SSL сертификаты..."
if [ -f "$TEMP_DIR/*/ssl-certificates.tar.gz" ]; then
    sudo tar -xzf $TEMP_DIR/*/ssl-certificates.tar.gz -C /
    success "SSL сертификаты восстановлены"
else
    warning "Бэкап SSL не найден, пропускаем"
fi

# Восстановление статических файлов
info "Восстанавливаем статические файлы..."
for env in production staging dev; do
    if [ -f "$TEMP_DIR/*/www-$env.tar.gz" ]; then
        sudo tar -xzf $TEMP_DIR/*/www-$env.tar.gz -C /
        success "Файлы $env восстановлены"
    fi
done

# Восстановление исходного кода
info "Восстанавливаем исходный код..."
if [ -f "$TEMP_DIR/*/source-code.tar.gz" ]; then
    sudo tar -xzf $TEMP_DIR/*/source-code.tar.gz -C /
    success "Исходный код восстановлен"
else
    warning "Бэкап исходного кода не найден, пропускаем"
fi

# Установка прав
info "Устанавливаем права доступа..."
sudo chown -R www-data:www-data /var/www/project-office* 2>/dev/null || true
sudo chmod -R 755 /var/www/project-office* 2>/dev/null || true
success "Права установлены"

# Проверка конфигурации Nginx
info "Проверяем конфигурацию Nginx..."
if sudo nginx -t 2>/dev/null; then
    success "Конфигурация Nginx корректна"
    
    # Перезагрузка Nginx
    info "Перезагружаем Nginx..."
    sudo systemctl reload nginx
    success "Nginx перезапущен"
else
    error "Ошибка в конфигурации Nginx. Проверьте вручную"
fi

# Очистка
info "Очищаем временные файлы..."
sudo rm -rf $TEMP_DIR
success "Временные файлы удалены"

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

echo ""
success "=========================================="
success "Восстановление завершено!"
success "=========================================="
echo ""
info "Бэкап: $BACKUP_FILE"
info "Дата восстановления: $(date)"
echo ""
