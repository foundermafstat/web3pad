# 🔄 Принудительный перезапуск сервера

## Проблема
Сервер все еще использует старую версию кода с `verifyMessageSignature`, несмотря на исправления.

## Пошаговое решение

### 1. Полная остановка сервера
```bash
# Нажмите Ctrl+C в терминале с сервером
# Если не помогает, закройте терминал полностью
```

### 2. Убить все процессы Node.js (Windows)
```bash
# Откройте командную строку как администратор
taskkill /f /im node.exe
```

### 3. Очистить кэш Node.js
```bash
# В папке server
cd server
rm -rf node_modules/.cache
# или на Windows:
rmdir /s node_modules\.cache
```

### 4. Перезапустить сервер
```bash
cd server
npm start
```

### 5. Проверить версию сервера
Откройте в браузере:
```
http://localhost:3001/api/auth/debug
```

Должно появиться:
```json
{
  "message": "Server is running updated version without verifyMessageSignature",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "2.0"
}
```

### 6. Если все еще не работает

#### Вариант A: Использовать скрипт перезапуска
```bash
cd server
node restart.js
```

#### Вариант B: Полная переустановка
```bash
cd server
rm -rf node_modules
npm install
npm start
```

### 7. Проверить работу
После успешного перезапуска попробуйте авторизацию через кошелек снова.

## Признаки успешного обновления
- В логах сервера должно появиться: `Stacks signature validation successful`
- НЕ должно быть ошибки: `verifyMessageSignature is not a function`
- Debug endpoint должен возвращать версию 2.0
