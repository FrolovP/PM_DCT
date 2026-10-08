#!/bin/bash

# ============================================
# Скрипт сборки Android-приложения
# ============================================

set -e

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Проверка зависимостей
info "Проверяем зависимости..."

if ! command -v node &> /dev/null; then
    error "Node.js не установлен"
fi

if ! command -v npm &> /dev/null; then
    error "npm не установлен"
fi

# Установка Capacitor (если не установлен)
if ! npm list @capacitor/core &> /dev/null; then
    info "Устанавливаем Capacitor..."
    npm install @capacitor/core @capacitor/cli @capacitor/android
    success "Capacitor установлен"
fi

# Сборка веб-приложения
info "Собираем веб-приложение..."
npm run build
success "Веб-приложение собрано"

# Инициализация Capacitor (если нужно)
if [ ! -d "android" ]; then
    info "Добавляем Android платформу..."
    npx cap add android
    success "Android платформа добавлена"
fi

# Копирование веб-файлов
info "Копируем веб-файлы в Android..."
npx cap copy android
success "Файлы скопированы"

# Синхронизация
info "Синхронизируем плагины..."
npx cap sync android
success "Синхронизация завершена"

# Сборка APK
info "Собираем APK..."
cd android

if [ "$1" == "release" ]; then
    # Релизная сборка
    ./gradlew assembleRelease
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
    success "Релизный APK собран: $APK_PATH"
else
    # Debug сборка
    ./gradlew assembleDebug
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    success "Debug APK собран: $APK_PATH"
fi

cd ..

# Копирование APK в корень проекта
cp android/$APK_PATH ./project-office.apk
success "APK скопирован в project-office.apk"

echo ""
success "=========================================="
success "Сборка завершена успешно!"
success "=========================================="
echo ""
info "APK: ./project-office.apk"
info "Размер: $(du -h project-office.apk | cut -f1)"
echo ""
info "Для установки на устройство:"
echo "  adb install project-office.apk"
echo ""
info "Для открытия в Android Studio:"
echo "  npx cap open android"
echo ""
