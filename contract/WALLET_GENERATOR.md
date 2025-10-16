# Wallet Generator - Руководство по использованию

## 🚀 Быстрый старт

### 1. Генерация одного кошелька
```bash
npm run generate-wallet
```

### 2. Генерация и сохранение в .env
```bash
npm run generate-wallet:save
```

### 3. Генерация mainnet кошелька
```bash
npm run generate-wallet:mainnet
```

### 4. Генерация нескольких кошельков
```bash
npm run generate-wallet:multiple
```

## 📋 Доступные команды

| Команда | Описание | Результат |
|---------|----------|-----------|
| `npm run generate-wallet` | Генерирует один тестовый кошелек | Показывает ключи в консоли |
| `npm run generate-wallet:mainnet` | Генерирует mainnet кошелек | Показывает ключи в консоли |
| `npm run generate-wallet:save` | Генерирует и сохраняет в .env | Создает .env файл |
| `npm run generate-wallet:multiple` | Генерирует 5 кошельков | Показывает все ключи |

## 🔑 Что генерируется

Для каждого кошелька создается:

- **Приватный ключ** (32 байта, 64 hex символа)
- **Публичный ключ** (33 байта, 66 hex символов, сжатый)
- **Stacks адрес** (SP для mainnet, ST для testnet)

## 📁 Формат .env файла

После генерации создается файл `.env` с содержимым:

```bash
# Generated wallet configuration
# Generated on: 2025-10-16T00:15:00.000Z

# Wallet Configuration
WALLET_PRIVATE_KEY=0x1234567890abcdef...
WALLET_PUBLIC_KEY=0x02abcdef1234567890...
WALLET_ADDRESS=ST1234567890ABCDEF...

# Server Configuration
SERVER_PRIVATE_KEY=0xabcdef1234567890...
SERVER_PUBLIC_KEY=0x03abcdef1234567890...

# Contract Configuration
CONTRACT_ADDRESS=SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9
CONTRACT_NAME=shooter-game

# Game Configuration
DEFAULT_GAME_ID=1
DEFAULT_REWARD_AMOUNT=1000000
DISPUTE_WINDOW_BLOCKS=120

# Network Configuration
STACKS_NETWORK=testnet
STACKS_RPC_URL=https://stacks-node-api.testnet.stacks.co
```

## 🎯 Использование сгенерированных ключей

### 1. Автоматическое использование
После генерации ключи автоматически используются в скриптах:

```bash
# Генерируем кошелек
npm run generate-wallet:save

# Используем ключи для подписи
npm run sign
# Вывод: "Using wallet keys from environment variables"

# Используем ключи для симуляции
npm run simulate
# Вывод: "Using server keys from environment variables"
```

### 2. Ручное использование
Можно скопировать ключи из вывода и использовать в других приложениях.

## 🔒 Безопасность

### ⚠️ Важные предупреждения

1. **Никогда не делитесь приватными ключами**
2. **Используйте тестовые ключи только для разработки**
3. **Для mainnet используйте проверенные кошельки**
4. **Храните ключи в безопасном месте**

### 🛡️ Рекомендации

- **Тестирование**: Используйте `npm run generate-wallet` (testnet)
- **Продакшен**: Используйте аппаратные кошельки
- **Резервное копирование**: Сохраните ключи в безопасном месте
- **Версионирование**: Не коммитьте .env файлы в git

## 🔧 Настройка

### Параметры командной строки

```bash
# Основные параметры
--mainnet          # Генерировать mainnet кошелек
--count=N          # Генерировать N кошельков
--save-env         # Сохранить в .env файл

# Примеры
node scripts/generate_wallet.js --mainnet
node scripts/generate_wallet.js --count=10
node scripts/generate_wallet.js --mainnet --save-env
```

### Переменные окружения

Можно настроить генератор через переменные окружения:

```bash
# В .env файле
DEFAULT_GAME_ID=2
DEFAULT_REWARD_AMOUNT=2000000
CONTRACT_ADDRESS=SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE
```

## 🐛 Устранение неполадок

### Проблема: "Signature Valid: false"
**Решение**: Перегенерируйте кошелек:
```bash
npm run generate-wallet:save
npm run sign
```

### Проблема: "Using wallet keys from environment variables" не появляется
**Решение**: Проверьте .env файл:
```bash
# Убедитесь, что .env файл существует
ls -la .env

# Перегенерируйте если нужно
npm run generate-wallet:save
```

### Проблема: Неправильный формат ключей
**Решение**: Скрипт автоматически исправляет форматы, но если проблемы остаются:
```bash
# Удалите .env и перегенерируйте
rm .env
npm run generate-wallet:save
```

## 📚 Дополнительная информация

- **[Configuration Guide](CONFIGURATION.md)** - Подробное руководство по настройке
- **[Development Guide](DEVELOPMENT_GUIDE.md)** - Руководство по разработке
- **[API Documentation](dev/shooter-module/README.md)** - Документация API контракта

## 🎉 Готово!

Теперь у вас есть полнофункциональный генератор кошельков для работы с контрактом shooter-game!
