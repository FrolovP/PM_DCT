#!/bin/bash

# ============================================
# Скрипт резервного копирования
# ============================================
# Использование: ./backup.sh [retention_days]
# Примеры:
#   ./backup.sh          - создать бэкап (хранить 30 дней)
#   ./backup.sh 7        - создать бэкап (хранить 7 дней)

set -e

# Цвета для вывода
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

# Параметры
RETENTION_DAYS=${1:-30}
BACKUP_DIR="/backup/project-office"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="project-office-backup-$DATE"

# Создание директории для бэкапов
info "Создаём директорию для бэкапов..."
sudo mkdir -p $BACKUP_DIR

# Создание временной директории
TEMP_DIR="/tmp/$BACKUP_NAME"
mkdir -p $TEMP_DIR

# 1. Бэкап конфигурации Nginx
info "Бэкапим конфигурацию Nginx..."
if [ -d "/etc/nginx" ]; then
    sudo tar -czf $TEMP_DIR/nginx-config.tar.gz /etc/nginx/sites-available/project-office* 2>/dev/null || warning "Не удалось создать бэкап Nginx"
    success "Конфигурация Nginx сохранена"
else
    warning "Nginx не найден, пропускаем"
fi

# 2. Бэкап SSL сертификатов
info "Бэкапим SSL сертификаты..."
if [ -d "/etc/letsencrypt" ]; then
    sudo tar -czf $TEMP_DIR/ssl-certificates.tar.gz /etc/letsencrypt 2>/dev/null || warning "Не удалось создать бэкап SSL"
    success "SSL сертификаты сохранены"
else
    warning "SSL сертификаты не найдены, пропускаем"
fi

# 3. Бэкап статических файлов
info "Бэкапим статические файлы..."
for env in production staging dev; do
    DEPLOY_PATH="/var/www/project-office"
    [ "$env" != "production" ] && DEPLOY_PATH="$DEPLOY_PATH-$env"
    
    if [ -d "$DEPLOY_PATH" ]; then
        sudo tar -czf $TEMP_DIR/www-$env.tar.gz $DEPLOY_PATH 2>/dev/null || warning "Не удалось создать бэкап $env"
        success "Файлы $env сохранены"
    fi
done

# 4. Бэкап исходного кода (если есть)
info "Бэкапим исходный код..."
if [ -d "/var/www/project-office-source" ]; then
    sudo tar -czf $TEMP_DIR/source-code.tar.gz /var/www/project-office-source 2>/dev/null || warning "Не удалось создать бэкап исходного кода"
    success "Исходный код сохранён"
else
    warning "Исходный код не найден, пропускаем"
fi

# 5. Бэкап системных логов (последние 1000 строк)
info "Бэкапим логи..."
mkdir -p $TEMP_DIR/logs
sudo tail -n 1000 /var/log/nginx/access.log > $TEMP_DIR/logs/nginx-access.log 2>/dev/null || true
sudo tail -n 1000 /var/log/nginx/error.log > $TEMP_DIR/logs/nginx-error.log 2>/dev/null || true
success "Логи сохранены"

# 6. Создание финального архива
info "Создаём финальный архив..."
cd /tmp
sudo tar -czf $BACKUP_DIR/$BACKUP_NAME.tar.gz $BACKUP_NAME
sudo rm -rf $TEMP_DIR

# Размер бэкапа
BACKUP_SIZE=$(du -h $BACKUP_DIR/$BACKUP_NAME.tar.gz | cut -f1)
success "Бэкап создан: $BACKUP_DIR/$BACKUP_NAME.tar.gz ($BACKUP_SIZE)"

# 7. Удаление старых бэкапов
info "Удаляем старые бэкапы (старше $RETENTION_DAYS дней)..."
OLD_BACKUPS=$(find $BACKUP_DIR -name "project-office-backup-*.tar.gz" -mtime +$RETENTION_DAYS)
if [ -n "$OLD_BACKUPS" ]; then
    find $BACKUP_DIR -name "project-office-backup-*.tar.gz" -mtime +$RETENTION_DAYS -delete
    success "Старые бэкапы удалены"
else
    info "Старых бэкапов не найдено"
fi

# 8. Вывод статистики
echo ""
success "=========================================="
success "Резервное копирование завершено!"
success "=========================================="
echo ""
info "Бэкап: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
info "Размер: $BACKUP_SIZE"
info "Дата: $(date)"
echo ""
info "Всего бэкапов: $(ls -1 $BACKUP_DIR/*.tar.gz 2>/dev/null | wc -l)"
info "Общий размер: $(du -sh $BACKUP_DIR 2>/dev/null | cut -f1)"
echo ""
info "Для восстановления используйте:"
echo "  sudo tar -xzf $BACKUP_DIR/$BACKUP_NAME.tar.gz -C /"
echo ""
