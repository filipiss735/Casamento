# Chá de Casa Nova — Filipi & Larissa

## Estrutura

- `frontend`: aplicação React.
- `backend`: API FastAPI com MongoDB.

## Executar o frontend

```bash
cd frontend
npm install
npm start
```

Depois da primeira instalação, use `npm ci` para reproduzir as versões do
`frontend/package-lock.json`. Use npm neste projeto; o `yarn.lock` é legado.
Para gerar a versão de produção, execute `npm run build` dentro de `frontend`.
O código React está em `frontend/src`. Os scripts carregam explicitamente
`craco_config.js`. Não é necessário usar `--force` ou `--legacy-peer-deps`.

Defina `REACT_APP_BACKEND_URL` em `frontend/.env` com a URL da API, sem o sufixo `/api`.

## Executar o backend

Crie um ambiente Python, instale `backend/requirements.txt` e defina no `backend/.env`:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=cha_casa_nova
CORS_ORIGINS=http://localhost:3000
ADMIN_EMAIL=seu-email
ADMIN_PASSWORD=uma-senha-forte
JWT_SECRET=um-segredo-longo-e-aleatorio
```

Inicie a API com:

```bash
uvicorn server:app --app-dir backend --host 0.0.0.0 --port 8000
```
