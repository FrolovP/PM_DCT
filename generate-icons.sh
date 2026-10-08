#!/bin/bash

# ============================================
# Скрипт генерации иконок для PWA и Android
# ============================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Проверка наличия ImageMagick или Inkscape
if ! command -v convert &> /dev/null && ! command -v inkscape &> /dev/null; then
    echo "Установите ImageMagick или Inkscape:"
    echo "  Ubuntu/Debian: sudo apt install imagemagick"
    echo "  macOS: brew install imagemagick"
    echo "  Или используйте Inkscape: sudo apt install inkscape"
    exit 1
fi

# Размеры иконок
sizes=(72 96 128 144 152 192 384 512)

info "Генерируем иконки..."

mkdir -p public/icons

for size in "${sizes[@]}"; do
    output="public/icons/icon-${size}x${size}.png"
    
    if command -v convert &> /dev/null; then
        # ImageMagick
        convert public/icons/icon.svg -resize ${size}x${size} "$output"
    elif command -v inkscape &> /dev/null; then
        # Inkscape
        inkscape public/icons/icon.svg --export-type=png --export-filename="$output" --export-width=$size --export-height=$size
    fi
    
    success "Создана иконка: $output"
done

# Создание иконки для Android (adaptive icon)
info "Создаём adaptive icon для Android..."

mkdir -p android/app/src/main/res/mipmap-anydpi-v26

cat > android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
EOF

cat > android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
EOF

# Создание цветов для background
mkdir -p android/app/src/main/res/values

cat > android/app/src/main/res/values/ic_launcher_background.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#4f46e5</color>
</resources>
EOF

success "Adaptive icon создан"

echo ""
success "=========================================="
success "Все иконки сгенерированы!"
success "=========================================="
echo ""
info "Иконки PWA: public/icons/"
info "Иконки Android: android/app/src/main/res/mipmap-*/"
echo ""
