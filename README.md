# Projeto Aplicado - Práticas de Mercado

Ambiente fullstack encapsulado utilizando **Docker Compose**, composto por:
- **MySQL 8.0** (Banco de dados relacional com persistência via volume Docker e healthcheck)
- **Django 4.2** (Backend REST API com suporte a MySQL, Allauth OAuth Google e CORS)
- **Next.js 14** (Frontend em React com App Router e integração em tempo real com o backend)

---

## 🏛️ Arquitetura dos Serviços

| Serviço | Container | Imagem / Base | Porta Host | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| **db** | `mysql_db` | `mysql:8.0` | `3306` | Banco de dados MySQL com volume persistente |
| **backend** | `django_backend` | Python 3.11-slim (`Dockerfile`) | `8000` | Backend Django com migrações automáticas |
| **frontend** | `nextjs_frontend` | Node 18-alpine (`frontend/Dockerfile`) | `3000` | Frontend Next.js com hot-reloading |

---

## 🚀 Como Executar

### 1. Pré-requisitos
- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/) instalados e em execução.

### 2. Configurar Variáveis de Ambiente
O projeto inclui um arquivo [.env.example](file:///.env.example). As variáveis principais já estão configuradas no arquivo [.env](file:///.env):

```bash
# Copie o arquivo de exemplo se necessário
cp .env.example .env
```

### 3. Iniciar todos os serviços
Para construir e iniciar os containers em segundo plano:

```bash
docker compose up -d --build
```

Para acompanhar os logs em tempo real:
```bash
docker compose logs -f
```

### 4. Parar os serviços
```bash
docker compose down
```

Para parar removendo os volumes de dados do MySQL (atenção: apaga dados do banco):
```bash
docker compose down -v
```

---

## 🌐 Endpoints e Acessos

- **Frontend (Next.js):** [http://localhost:3000](http://localhost:3000)
  - **Dashboard (Painel):** [http://localhost:3000/](http://localhost:3000/) - Painel moderno com métricas, monitoramento em tempo real dos containers e atalhos.
  - **Sign-in Side Template:** [http://localhost:3000/sign-in-side](http://localhost:3000/sign-in-side) - Layout oficial de autenticação em duas colunas (Branding + Formulário) com suporte ao Google OAuth.
  - **Sign-in Template:** [http://localhost:3000/sign-in](http://localhost:3000/sign-in) - Layout oficial clássico de login com card centralizado.
- **Backend (Django REST Framework):** [http://localhost:8000](http://localhost:8000)
- **API de Autenticação Desacoplada (Google / DRF Token):**
  - `POST /api/auth/google/`: Recebe `credential` (Google ID Token) ou `code` do frontend, valida no Google, cria/busca usuário no MySQL e retorna o **Token DRF** (`Token.key`).
  - `GET /api/auth/me/`: Retorna os dados do usuário autenticado via Header `Authorization: Token <token>`.
  - `POST /api/auth/logout/`: Revoga o token de autenticação no banco MySQL.
  - `GET /api/auth/config/`: Expõe o `client_id` do Google para o frontend.
- **Health Check API:** [http://localhost:8000/api/health/](http://localhost:8000/api/health/)
  - Retorna o status do Django e da conexão ativa com o MySQL.
- **Django Admin:** [http://localhost:8000/admin/](http://localhost:8000/admin/)
- **MySQL:** `localhost:3306` (Usuário: `app_user`, Senha: `app_password`, Database: `projeto_db`)

---

## 🔐 Como utilizar o Token no DRF e GraphQL

O fluxo de autenticação foi 100% desacoplado dos templates do Django:
1. O frontend Next.js executa o login do Google (via **Google Identity Services** ou formulário).
2. O Next.js envia a credencial para `POST /api/auth/google/`.
3. O Django valida a credencial com a Google API e gera um token persistido (`rest_framework.authtoken.models.Token`).
4. O Next.js armazena esse token para requisições subsequentes.

### Exemplo de uso no Header (DRF e GraphQL):
```http
Authorization: Token 9507c49728ed8764e8998189ce79ad27878b9a51
```

### Exemplo de chamada GraphQL autenticada (JavaScript / Next.js):
```javascript
const response = await fetch('http://localhost:8000/graphql/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Token ${token}`,
  },
  body: JSON.stringify({
    query: `query { currentUser { id email username } }`
  })
});
```


---

## 🛠️ Comandos Úteis

### Criar um Superusuário no Django
```bash
docker compose exec backend python projeto_aplicado/manage.py createsuperuser
```

### Executar Migrações Manualmente
*(Obs: As migrações já são aplicadas automaticamente pelo script de inicialização do container)*
```bash
docker compose exec backend python projeto_aplicado/manage.py migrate
```

### Acessar o Shell do MySQL via Linha de Comando
```bash
docker compose exec db mysql -u app_user -papp_password projeto_db
```

### Acessar o Terminal de Qualquer Container
```bash
# Terminal do Backend Django
docker compose exec backend bash

# Terminal do Frontend Next.js
docker compose exec frontend sh
```