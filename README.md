# Financial Manager

Sistema de gerenciamento financeiro pessoal com suporte a múltiplas carteiras, transações recorrentes, metas de poupança e exportação de relatórios em PDF/Excel.

## Funcionalidades

- Múltiplas carteiras (pessoal, empresarial, etc.)
- Registro de receitas, despesas e transferências entre carteiras
- Categorias personalizáveis com cor e ícone
- Transações recorrentes (diária, semanal, mensal, anual)
- Metas de poupança com acompanhamento de progresso
- Exportação de relatórios em PDF e Excel
- Notificações em tempo real
- Autenticação com JWT e refresh token
- Documentação automática via Swagger

## Stack

| Camada | Tecnologia |
|--------|-----------|
| API | Node.js + TypeScript + Fastify |
| ORM | Prisma |
| Banco de dados | PostgreSQL 16 |
| Cache | Redis 7 |
| Validação | Zod |
| Injeção de dependência | tsyringe |
| Frontend | React 19 + TypeScript + Vite |
| Estilização | Tailwind CSS |
| Gráficos | Recharts |

## Pré-requisitos

- Docker e Docker Compose
- Node.js 18+
- Make

## Configuração

### 1. Variáveis de ambiente

Crie o arquivo `.env` na pasta `financial-manager-api/`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/financial_manager"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="sua-chave-secreta"
JWT_EXPIRES_IN="1d"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

### 2. Subir os containers

```bash
cd financial-manager-api
make up
```

### 3. Rodar as migrations

```bash
make db-migrate
make db-generate
```

### 4. Subir o frontend

```bash
cd financial-manager-ui
npm install
npm run dev
```

A API estará disponível em `http://localhost:3000` e a documentação Swagger em `http://localhost:3000/docs`.

## Endpoints principais

### Autenticação
```
POST /register       Criar conta
POST /login          Login (retorna JWT + refresh token)
POST /refresh        Renovar token
POST /logout         Logout
```

### Carteiras
```
GET    /wallets       Listar carteiras
POST   /wallets       Criar carteira
PUT    /wallets/:id   Atualizar carteira
DELETE /wallets/:id   Remover carteira
```

### Transações
```
GET    /transactions              Listar transações
POST   /transactions              Criar transação
PUT    /transactions/:id          Atualizar transação
DELETE /transactions/:id          Remover transação
POST   /transactions/transfer     Transferência entre carteiras
GET    /transactions/export       Exportar (PDF ou Excel)
```

### Categorias
```
GET    /categories       Listar categorias
POST   /categories       Criar categoria personalizada
PUT    /categories/:id   Atualizar
DELETE /categories/:id   Remover
```

### Recorrências
```
GET    /recurrences       Listar recorrências
POST   /recurrences       Criar recorrência
PUT    /recurrences/:id   Atualizar
DELETE /recurrences/:id   Remover
```

### Metas de poupança
```
GET    /savings-goals       Listar metas
POST   /savings-goals       Criar meta
PUT    /savings-goals/:id   Atualizar
DELETE /savings-goals/:id   Remover
```

### Relatórios
```
GET /reports/summary       Resumo financeiro
GET /reports/by-category   Relatório por categoria
GET /reports/by-period     Relatório por período
```

## Estrutura do projeto

```
financial-manager/
├── financial-manager-api/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── wallets/
│   │   │   ├── transactions/
│   │   │   ├── categories/
│   │   │   ├── recurrences/
│   │   │   ├── savings-goals/
│   │   │   ├── notifications/
│   │   │   ├── reports/
│   │   │   └── profile/
│   │   └── shared/
│   │       └── middlewares/
│   └── prisma/
│       └── schema.prisma
└── financial-manager-ui/
    └── src/
        └── modules/   # espelho dos módulos da API
```

## Modelo de dados

- **User** → possui N Wallets, Transactions, SavingsGoals, Notifications
- **Wallet** → possui N Transactions e Recurrences
- **Category** → possui N Transactions e Recurrences
- **Recurrence** → gera N Transactions automaticamente via cron
- **SavingsGoal** → rastreia valor atual vs. meta
- Valores monetários armazenados como `Decimal(15,2)`
- IDs como UUID
- Soft delete em Wallets

## Comandos úteis

```bash
make up           # Subir containers
make down         # Parar containers
make logs         # Ver logs
make db-migrate   # Rodar migrations
make db-generate  # Gerar Prisma client
```
