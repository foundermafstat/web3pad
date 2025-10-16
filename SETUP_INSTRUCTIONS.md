# Инструкции по настройке проекта

## Настройка окружения

### 1. Настройка сервера

Скопируйте файл примера конфигурации:
```bash
cp server/server-config.example.env server/server-config.env
```

Отредактируйте `server/server-config.env` и укажите ваши реальные значения:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/osg_db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Stacks Blockchain Integration
STACKS_SERVER_PRIVATE_KEY="your-stacks-server-private-key"
STACKS_SERVER_PUBLIC_KEY="your-stacks-server-public-key"
STACKS_REGISTRY_CONTRACT="ST35VF8C78N77VPKF4ZQSDW158X80T7QZ3E4MMYS9.registry"
STACKS_SHOOTER_CONTRACT="ST35VF8C78N77VPKF4ZQSDW158X80T7QZ3E4MMYS9.shooter-game"

# Game Configuration
GAME_SERVER_PORT=3001
GAME_SERVER_HOST=localhost

# Leather Wallet (optional)
LEATHER_API_KEY="your-leather-api-key"

# OpenAI (optional)
OPENAI_API_KEY="your-openai-api-key"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### 2. Настройка Stacks блокчейна

Скопируйте файл примера конфигурации:
```bash
cp stacks/settings/Devnet.example.toml stacks/settings/Devnet.toml
```

Отредактируйте `stacks/settings/Devnet.toml` и укажите ваши мнемоники и адреса.

### 3. Настройка клиента

Обновите IP адрес в `client/env.config.ts`:
```typescript
const DEV_LOCAL_IP = 'YOUR_LOCAL_IP_HERE';
```

### 4. Настройка тестовых файлов

Создайте тестовые файлы на основе примеров:
```bash
cp test-server-connection.example.js test-server-connection.js
cp test-shooter-connection.example.js test-shooter-connection.js
```

Отредактируйте IP адреса в тестовых файлах.

## Безопасность

- Никогда не коммитьте файлы с реальными секретами
- Используйте переменные окружения для всех чувствительных данных
- Регулярно ротируйте ключи и пароли
- Проверяйте .gitignore перед коммитом

## Деплой

1. Убедитесь, что все секретные файлы исключены из репозитория
2. Настройте переменные окружения на продакшн сервере
3. Обновите конфигурацию для продакшн окружения
4. Запустите деплой

## Публичные адреса контрактов

Следующие адреса контрактов являются публичными и могут быть оставлены в коде:
- Registry: `ST35VF8C78N77VPKF4ZQSDW158X80T7QZ3E4MMYS9.registry`
- Shooter Game: `ST35VF8C78N77VPKF4ZQSDW158X80T7QZ3E4MMYS9.shooter-game`
