# Shooter Game Blockchain Integration

## Обзор

Система интегрирует игру-шутер с блокчейном Stacks, позволяя игрокам:
- Подключаться через мобильные устройства как контроллеры
- Авторизоваться через кошелек Leather
- Играть с системой 3 жизней
- Автоматически сохранять результаты в блокчейн

## Архитектура

### Клиентская часть
- **ShooterMobileController.tsx** - Мобильный контроллер для игры
- **/game/shooter/controller** - Страница контроллера
- WebSocket соединение для real-time взаимодействия

### Серверная часть
- **shooterGame.js** - Обновленная игра с системой жизней и блокчейн интеграцией
- **blockchain-game.js** - API для работы с блокчейн результатами
- **gameRoomManager.js** - Управление комнатами с поддержкой walletAddress
- WebSocket обработчики для shooter игры

### Блокчейн
- **shooter-game.clar** - Смарт-контракт для сохранения результатов
- API для сохранения и получения игровых результатов

## Использование

### 1. Создание комнаты
```javascript
// Создать комнату shooter игры
const roomId = 'shooter_room_123';
roomManager.createRoom(roomId, 'shooter', {
  name: 'Shooter Battle',
  maxPlayers: 4
});
```

### 2. Подключение мобильного контроллера
```
http://localhost:3000/game/shooter/controller?roomId=shooter_room_123
```

### 3. Авторизация
- Пользователь подключает кошелек Leather
- Система получает walletAddress
- Создается игровая сессия с привязкой к адресу

### 4. Игровой процесс
- Игрок имеет 3 жизни
- При смерти теряет 1 жизнь
- После 3 смертей игра заканчивается
- Результаты автоматически сохраняются в блокчейн

## API Endpoints

### Сохранение результата игры
```http
POST /api/blockchain/save-game-result
Content-Type: application/json

{
  "playerAddress": "SP1...",
  "finalScore": 1500,
  "kills": 5,
  "deaths": 2,
  "botKills": 3,
  "gameType": "shooter",
  "roomId": "shooter_room_123",
  "timestamp": 1640995200000
}
```

### Получение истории игрока
```http
GET /api/blockchain/player-history/SP1...
```

### Получение статистики игр
```http
GET /api/blockchain/game-stats
```

## WebSocket Events

### Клиент -> Сервер
- `shooter:auth` - Авторизация с кошельком
- `shooter:input` - Движение игрока
- `shooter:aim` - Прицеливание
- `shooter:shoot` - Стрельба

### Сервер -> Клиент
- `shooter:auth:success` - Успешная авторизация
- `shooter:auth:error` - Ошибка авторизации
- `gameState` - Состояние игры
- `gameOver` - Окончание игры с результатами

## Система жизней

### Логика
1. Игрок начинает с 3 жизнями
2. При попадании пули теряет 1 жизнь
3. После потери жизни респавнится через 2 секунды
4. При потере всех жизней игра заканчивается
5. Результаты сохраняются в блокчейн

### Структура данных игрока
```javascript
{
  id: "player_id",
  walletAddress: "SP1...",
  lives: 3,
  maxLives: 3,
  kills: 5,
  deaths: 2,
  botKills: 3,
  gameOver: false,
  finalScore: 1500
}
```

## Блокчейн интеграция

### Смарт-контракт функции
- `start-session` - Начать игровую сессию
- `report-result` - Сохранить результат игры
- `claim-reward` - Получить награду
- `get-player-stats` - Получить статистику игрока

### Структура результата
```clarity
{
  player: principal,
  final-score: uint,
  kills: uint,
  deaths: uint,
  bot-kills: uint,
  game-type: (string-ascii 16),
  room-id: (string-ascii 32),
  timestamp: uint
}
```

## Безопасность

### Валидация
- Проверка подписи сервера для результатов
- Защита от replay атак через хеши результатов
- Валидация walletAddress

### Ограничения
- Максимум 3 жизни на игру
- Таймаут на респавн (2 секунды)
- Ограничение на количество пуль

## Мониторинг

### Логи
- Подключение/отключение игроков
- Авторизация через кошелек
- Сохранение результатов в блокчейн
- Ошибки WebSocket соединения

### Метрики
- Количество активных игр
- Средний счет игроков
- Количество сохраненных результатов
- Статистика по кошелькам

## Развертывание

### Требования
- Node.js 18+
- Stacks blockchain access
- Leather wallet integration
- WebSocket support

### Переменные окружения
```env
STACKS_NETWORK=testnet
STACKS_CONTRACT_ADDRESS=SP...
LEATHER_WALLET_URL=https://wallet.hiro.so
```

### Запуск
```bash
# Сервер
npm run dev:server

# Клиент
npm run dev:client
```

## Тестирование

### Мобильный контроллер
1. Откройте `http://localhost:3000/game/shooter/controller?roomId=test123`
2. Подключите кошелек Leather
3. Играйте до окончания игры
4. Проверьте сохранение результатов

### API тестирование
```bash
# Тест сохранения результата
curl -X POST http://localhost:3001/api/blockchain/save-game-result \
  -H "Content-Type: application/json" \
  -d '{"playerAddress":"SP1...","finalScore":1000,"kills":3,"deaths":1,"botKills":2,"gameType":"shooter","roomId":"test123","timestamp":1640995200000}'
```

## Будущие улучшения

- [ ] NFT интеграция для персонажей
- [ ] Система наград и достижений
- [ ] Турнирный режим
- [ ] Рейтинговая система
- [ ] Мультиплеер с несколькими игроками
- [ ] Интеграция с другими играми
