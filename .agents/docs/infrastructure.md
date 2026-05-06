# Infrastructure — Docker e Ambiente

O projeto utiliza uma arquitetura modular com Docker Compose separado para API e UI, permitindo o gerenciamento independente de cada serviço.

---

## Backend (financial-manager-api)

O Compose do backend gerencia a API Node.js, o banco de dados PostgreSQL e o cache Redis.

### docker-compose.yml
```yaml
services:
  api:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgresql://financial:financial@db:5432/financial
      REDIS_URL: redis://cache:6379
    depends_on:
      db: { condition: service_healthy }
      cache: { condition: service_healthy }
    networks: [financial-network]

  db:
    image: postgres:16-alpine
    volumes:
      - ./docker/postgres:/docker-entrypoint-initdb.d
      - postgres_data:/var/lib/postgresql/data
    networks: [financial-network]

  cache:
    image: redis:7-alpine
    volumes:
      - ./docker/redis:/usr/local/etc/redis
      - redis_data:/data
    networks: [financial-network]

networks:
  financial-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

---

## Frontend (financial-manager-ui)

O Compose do frontend gerencia a interface em modo desenvolvimento (Vite).

### docker-compose.yml
```yaml
services:
  ui:
    build: .
    ports: ["5173:5173"]
    environment:
      - VITE_API_URL=http://localhost:3000
    networks: [financial-network]

networks:
  financial-network:
    external: true
```

---

## Variáveis de Ambiente

Cada projeto possui seu próprio arquivo `.env`.

### API (.env)
```env
DATABASE_URL=postgresql://financial:financial@localhost:5432/financial
REDIS_URL=redis://localhost:6379
JWT_SECRET=mudar-em-producao
PORT=3000
```

---

## Comandos Úteis

### No Backend
```bash
docker-compose up -d    # Sobe API + DB + Cache
npm run migrate:dev     # Roda migrations
```

### No Frontend
```bash
docker-compose up -d    # Sobe UI (requer que a rede da API exista)
```

---

## tsconfig.json (Backend)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```
