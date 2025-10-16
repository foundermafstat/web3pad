# Руководство по работе с мнемонической фразой

## 🔑 Получение ключей из мнемонической фразы

Если у вас есть кошелек с тестовыми токенами и мнемоническая фраза (seed phrase), вы можете получить из неё приватный и публичный ключи.

## 📝 Ваша мнемоническая фраза

```
engage shadow vessel cute recycle wasp tool casual pole uncle ceiling wrap casual diet cattle option immense ghost mercy cube sustain avocado rain sugar
```

## 🚀 Быстрое использование

### 1. Получить ключи из мнемонической фразы
```bash
cd contract
node scripts/get_keys_from_seed.js "engage shadow vessel cute recycle wasp tool casual pole uncle ceiling wrap casual diet cattle option immense ghost mercy cube sustain avocado rain sugar"
```

### 2. Сохранить ключи в .env файл
```bash
node scripts/get_keys_from_seed.js "engage shadow vessel cute recycle wasp tool casual pole uncle ceiling wrap casual diet cattle option immense ghost mercy cube sustain avocado rain sugar" --save-env
```

### 3. Использовать ключи для тестирования
```bash
npm run sign
npm run simulate
```

## 🔧 Доступные команды

| Команда | Описание |
|---------|----------|
| `npm run get-keys-from-seed` | Показать справку по использованию |
| `node scripts/get_keys_from_seed.js "фраза"` | Получить ключи из фразы |
| `node scripts/get_keys_from_seed.js "фраза" --save-env` | Сохранить в .env |

## 📊 Результат

Из вашей мнемонической фразы генерируются:

- **Приватный ключ**: `0x871c5224f44b451989fee68d4178b151c07e2c28707fd4f33e849660d94c7816`
- **Публичный ключ**: `0x02a13135e90761759a0782802b9759dbf83554913b8e1cc1057e4e9cb37bb2e74c`
- **Stacks адрес**: `STFBF35A9C8571C8BC95F97A6E27BB5D286344A516`

## ✅ Проверка работы

После генерации ключей проверьте:

1. **Подпись работает**: `npm run sign` → `Signature Valid: true`
2. **Симуляция работает**: `npm run simulate` → полный цикл выполняется
3. **Используются ваши ключи**: `Using wallet keys from environment variables`

## 🔒 Безопасность

### ⚠️ Важные предупреждения

1. **Никогда не делитесь мнемонической фразой**
2. **Никогда не делитесь приватными ключами**
3. **Используйте только для тестирования**
4. **Храните в безопасном месте**

### 🛡️ Рекомендации

- **Тестирование**: Используйте testnet ключи
- **Продакшен**: Используйте аппаратные кошельки
- **Резервное копирование**: Сохраните фразу в безопасном месте
- **Версионирование**: Не коммитьте .env файлы в git

## 🔧 Настройка

### Параметры командной строки

```bash
# Основные параметры
--save-env         # Сохранить ключи в .env файл
--mainnet          # Генерировать mainnet адрес

# Примеры
node scripts/get_keys_from_seed.js "фраза" --save-env
node scripts/get_keys_from_seed.js "фраза" --mainnet --save-env
```

### Переменные окружения

Можно настроить через .env файл:

```bash
# В .env файле
MNEMONIC=engage shadow vessel cute recycle wasp tool casual pole uncle ceiling wrap casual diet cattle option immense ghost mercy cube sustain avocado rain sugar
```

## 🐛 Устранение неполадок

### Проблема: "Mnemonic must be 12 or 24 words"
**Решение**: Проверьте количество слов:
```bash
# Должно быть ровно 12 или 24 слова
echo "engage shadow vessel cute recycle wasp tool casual pole uncle ceiling wrap casual diet cattle option immense ghost mercy cube sustain avocado rain sugar" | wc -w
```

### Проблема: "Signature Valid: false"
**Решение**: Перегенерируйте ключи:
```bash
node scripts/get_keys_from_seed.js "ваша_фраза" --save-env
npm run sign
```

### Проблема: Неправильный адрес
**Решение**: Проверьте формат фразы:
```bash
# Убедитесь, что фраза в кавычках
node scripts/get_keys_from_seed.js "engage shadow vessel cute ..."
```

## 📚 Дополнительная информация

- **[Wallet Generator](WALLET_GENERATOR.md)** - Генерация новых кошельков
- **[Configuration Guide](CONFIGURATION.md)** - Настройка переменных окружения
- **[Development Guide](DEVELOPMENT_GUIDE.md)** - Руководство по разработке

## 🎉 Готово!

Теперь у вас есть ключи из вашего существующего кошелька и вы можете тестировать контракт!
