# 🤖 Android-приложение "Проектный офис"

Нативное Android-приложение для работы с платформой проектных офисов.

## 📱 Возможности

✅ Полный функционал веб-версии  
✅ Работа офлайн (базовая функциональность)  
✅ Push-уведомления  
✅ Биометрическая аутентификация (планируется)  
✅ Камера для QR-кодов (планируется)  
✅ Нативная навигация  

## 🚀 Быстрый старт

### Требования

- **Node.js** 18+
- **npm** 8+
- **Android Studio** (последняя версия)
- **Java JDK** 17+
- **Android SDK** (API 21+)

### Установка

```bash
# 1. Клонируйте репозиторий
git clone <repository-url>
cd project-office-platform

# 2. Установите зависимости
npm install

# 3. Установите Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 4. Соберите веб-приложение
npm run build

# 5. Добавьте Android платформу
npx cap add android

# 6. Скопируйте файлы
npx cap copy android

# 7. Откройте в Android Studio
npx cap open android
```

### Сборка APK

#### Автоматическая сборка (рекомендуется)

```bash
# Debug версия
chmod +x build-android.sh
./build-android.sh

# Release версия
./build-android.sh release
```

#### Ручная сборка

```bash
# 1. Соберите веб-приложение
npm run build

# 2. Скопируйте файлы
npx cap copy android

# 3. Перейдите в директорию Android
cd android

# 4. Соберите APK
./gradlew assembleDebug

# 5. APK будет в:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Установка на устройство

```bash
# Через ADB
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Или скопируйте APK на устройство и установите вручную
```

## 📦 Структура проекта

```
project-office-platform/
├── android/                    # Android проект
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/          # Java/Kotlin код
│   │   │   ├── res/           # Ресурсы (иконки, layouts)
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle
│   └── build.gradle
├── public/
│   ├── icons/                 # Иконки приложения
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service Worker
├── src/                       # React исходники
├── capacitor.config.json      # Конфигурация Capacitor
└── build-android.sh           # Скрипт сборки
```

## 🎨 Кастомизация

### Изменение иконки

1. Замените `public/icons/icon.svg` на свою иконку
2. Запустите генерацию иконок:
```bash
chmod +x generate-icons.sh
./generate-icons.sh
```

### Изменение названия

Отредактируйте `capacitor.config.json`:
```json
{
  "appName": "Ваше название",
  "appId": "com.yourcompany.app"
}
```

### Изменение цветовой схемы

Отредактируйте `android/app/src/main/res/values/ic_launcher_background.xml`:
```xml
<color name="ic_launcher_background">#your_color</color>
```

## 🔐 Подпись APK для релиза

### 1. Создайте keystore

```bash
keytool -genkey -v -keystore release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias release
```

### 2. Создайте файл ключей

Создайте `android/key.properties`:
```properties
storePassword=your_password
keyPassword=your_password
keyAlias=release
storeFile=../release-key.jks
```

### 3. Обновите build.gradle

Отредактируйте `android/app/build.gradle`:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 4. Соберите релизный APK

```bash
cd android
./gradlew assembleRelease
```

## 📤 Публикация в Google Play

### 1. Регистрация разработчика

- Зарегистрируйтесь на [Google Play Console](https://play.google.com/console)
- Оплатите единоразовый взнос ($25)

### 2. Создание приложения

1. Нажмите "Создать приложение"
2. Заполните информацию:
   - Название приложения
   - Язык по умолчанию
   - Тип приложения (Приложение)
   - Категория (Бизнес)

### 3. Заполнение карточки приложения

#### Основная информация
- Краткое описание (до 80 символов)
- Полное описание (до 4000 символов)
- Что нового в версии

#### Графические материалы
- Иконка приложения (512x512 PNG)
- Скриншоты (минимум 2, максимум 8)
  - Телефон: 16:9 или 9:16
  - Планшет 7": 16:9 или 9:16
  - Планшет 10": 16:9 или 9:16
- Feature graphic (1024x500 PNG)

#### Классификация контента
- Заполните опросник
- Получите рейтинг

#### Целевая аудитория
- Укажите возрастную группу

### 4. Загрузка APK/AAB

```bash
# Создайте Android App Bundle (рекомендуется)
cd android
./gradlew bundleRelease

# AAB будет в:
# android/app/build/outputs/bundle/release/app-release.aab
```

### 5. Отправка на проверку

1. Загрузите AAB или APK
2. Заполните все обязательные поля
3. Нажмите "Отправить на проверку"
4. Ожидайте проверки (обычно 1-3 дня)

## 🔧 Нативные функции

### Push-уведомления

```bash
# Установите плагин
npm install @capacitor/local-notifications

# Синхронизируйте
npx cap sync
```

Пример использования:
```typescript
import { LocalNotifications } from '@capacitor/local-notifications';

await LocalNotifications.schedule({
  notifications: [
    {
      title: 'Новая задача',
      body: 'Вам назначена новая задача',
      id: 1,
      schedule: { at: new Date(Date.now() + 1000 * 5) },
      sound: null,
      attachments: null,
      actionTypeId: "",
      extra: null
    }
  ]
});
```

### Камера

```bash
npm install @capacitor/camera
npx cap sync
```

### Геолокация

```bash
npm install @capacitor/geolocation
npx cap sync
```

### Биометрическая аутентификация

```bash
npm install @capacitor/identity
npx cap sync
```

## 🐛 Отладка

### Просмотр логов

```bash
# Через ADB
adb logcat | grep "ProjectOffice"

# Или через Android Studio
# View → Tool Windows → Logcat
```

### Chrome DevTools для WebView

1. Включите отладку в приложении
2. Откройте Chrome
3. Перейдите в `chrome://inspect`
4. Найдите ваше устройство и приложение
5. Нажмите "Inspect"

### Эмулятор

```bash
# Запуск эмулятора
emulator -avd Pixel_4_API_30

# Установка APK
adb install app-debug.apk

# Скриншот
adb exec-out screencap -p > screen.png
```

## 📊 Мониторинг и аналитика

### Crashlytics (рекомендуется)

1. Добавьте Firebase в проект
2. Установите плагин:
```bash
npm install @capacitor/firebase-analytics
npx cap sync
```

### Google Analytics

```bash
npm install @capacitor/google-analytics
npx cap sync
```

## 🔒 Безопасность

### ProGuard

Включите минификацию в `android/app/build.gradle`:
```gradle
buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### SSL Pinning (опционально)

Для повышения безопасности добавьте SSL pinning в `MainActivity.kt`.

### Хранение данных

Используйте EncryptedSharedPreferences для чувствительных данных:
```bash
npm install @capacitor/preferences
```

## 📈 Оптимизация

### Размер APK

```bash
# Проверьте размер
ls -lh android/app/build/outputs/apk/debug/app-debug.apk

# Уменьшите размер:
# 1. Включите ProGuard
# 2. Удалите неиспользуемые ресурсы
# 3. Используйте WebP вместо PNG
```

### Производительность

1. Включите Hardware Acceleration
2. Оптимизируйте WebView
3. Используйте кэширование

## 📚 Полезные ссылки

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developers](https://developer.android.com/)
- [Google Play Console](https://play.google.com/console)
- [Material Design](https://material.io/design)

## 🆘 Поддержка

При возникновении проблем:
1. Проверьте логи: `adb logcat`
2. Очистите кэш: `npx cap clean android`
3. Пересоберите: `./build-android.sh`

---

**Версия**: 1.0.0  
**Минимальная версия Android**: 5.0 (API 21)  
**Целевая версия Android**: 14 (API 34)  
**Обновлено**: 2025
