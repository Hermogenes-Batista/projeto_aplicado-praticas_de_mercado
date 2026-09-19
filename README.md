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
  - **Dashboard (Painel):** [http://localhost:3000/](http://localhost:3000/) - Painel com métricas dos TODOs e atalhos de navegação.
  - **Sign-in Template:** [http://localhost:3000/sign-in](http://localhost:3000/sign-in) - Layout oficial clássico de login com card centralizado.
- **Backend (Django):** [http://localhost:8000](http://localhost:8000)
- **Autenticação GraphQL:**
  - query `me`: retorna o usuário autenticado;
  - query `googleClientId`: expõe o `client_id` público do Google;
  - mutation `login`: autentica com usuário/e-mail e senha;
  - mutation `loginWithGoogle`: autentica com credencial ou código OAuth do Google;
  - mutation `refreshToken`: renova a sessão usando o cookie `refresh_token`;
  - mutation `logout`: invalida o refresh token e remove os cookies.
  O DRF e o SimpleJWT continuam sendo usados internamente para validação,
  serializers e geração/blacklist dos tokens, mas não há endpoints REST de
  autenticação registrados para o frontend.
- **Health Check API:** [http://localhost:8000/api/health/](http://localhost:8000/api/health/)
  - Retorna o status do Django e da conexão ativa com o MySQL.
- **GraphQL API:** [http://localhost:8000/graphql/](http://localhost:8000/graphql/)
  - `login`: autentica com usuário e senha e define os cookies JWT.
  - `loginWithGoogle`: autentica com Google e define os cookies JWT.
  - `refreshToken`: renova os cookies JWT.
  - `logout`: invalida o refresh token do cookie e remove os cookies.
  - `me`: retorna os dados do usuário autenticado.
- **Django Admin:** [http://localhost:8000/admin/](http://localhost:8000/admin/)
- **MySQL:** `localhost:3306` (Usuário: `app_user`, Senha: `app_password`, Database: `projeto_db`)

---

## 🔐 Como utilizar o JWT no DRF e GraphQL

O fluxo de autenticação foi 100% desacoplado dos templates do Django:
1. O frontend Next.js executa o login do Google (via **Google Identity Services** ou formulário).
2. O Next.js envia a credencial para a mutation `loginWithGoogle`.
3. O Django valida a credencial com a Google API e gera tokens JWT com validade de 5 minutos para o access token e 1 dia para o refresh token.
4. O backend entrega os tokens em cookies `HttpOnly`, `SameSite` e protegidos
   por configuração `Secure` fora do desenvolvimento local. O Next.js mantém
   apenas o access token em memória e renova a sessão usando o cookie de
   refresh, sem persistir tokens no `localStorage`.

### Exemplo de uso no Header (DRF e GraphQL):
```http
Authorization: Bearer eyJ...
```

### Exemplo de chamada GraphQL autenticada (JavaScript / Next.js):
```javascript
const response = await fetch('http://localhost:8000/graphql/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    query: `query { currentUser { id email username } }`
  })
});
```

## 🛡️ Segurança aplicada — OWASP Top 10:2025

O protótipo aplica medidas de **Secure by Design** para mitigar as seguintes
categorias da OWASP Top 10:2025:

### A01 — Broken Access Control

- As consultas de atividades e itens filtram os registros pelo usuário
  autenticado (`created_by`).
- As mutações validam a propriedade do registro antes de editar ou excluir
  qualquer dado.
- A atividade informada para um item também precisa pertencer ao usuário
  autenticado.
- Implementação principal:
  - `projeto_aplicado/todo_app/graphql/queries/categories.py`
  - `projeto_aplicado/todo_app/graphql/queries/items.py`
  - `projeto_aplicado/todo_app/graphql/mutations/helpers.py`
  - `projeto_aplicado/todo_app/graphql/mutations/activity.py`
  - `projeto_aplicado/todo_app/graphql/mutations/item.py`

### A07 — Authentication Failures

- O backend utiliza access tokens e refresh tokens JWT com validade limitada.
- Refresh tokens são rotacionados e enviados para blacklist após a rotação.
- O logout invalida o refresh token.
- Access e refresh tokens são enviados por cookies `HttpOnly`, reduzindo a
  exposição dos tokens a scripts executados no navegador.
- A sessão persistida é validada no backend antes de liberar o dashboard.
- O frontend renova o access token quando necessário e encerra a sessão
  quando a renovação falha.
- Há logout automático por inatividade e sincronização de logout entre abas.
- Implementação principal:
  - `projeto_aplicado/praticas_de_mercado/settings.py`
  - `projeto_aplicado/handle_oauth/serializers/login.py`
  - `projeto_aplicado/handle_oauth/serializers/logout.py`
  - `projeto_aplicado/handle_oauth/graphql/utils.py`
  - `frontend/src/context/AuthContext.tsx`

### A05 — Injection

- O acesso ao banco utiliza o ORM do Django, sem SQL concatenado a partir de
  entradas do usuário.
- Serializers validam os dados recebidos antes de persistir atividades e itens.
- Operações GraphQL usam variáveis tipadas, em vez de interpolar valores
  diretamente nas consultas.
- O React escapa valores textuais renderizados na interface por padrão.
- Implementação principal:
  - `projeto_aplicado/todo_app/serializers/activity.py`
  - `projeto_aplicado/todo_app/serializers/item.py`
  - `projeto_aplicado/todo_app/graphql/mutations/`
  - `frontend/src/graphql/todo.graphql`

### Uso de inteligência artificial no desenvolvimento

O desenvolvimento e a auditoria do código foram realizados com auxílio de
inteligência artificial, utilizada para:

- gerar e refatorar código do frontend e backend;
- analisar fluxos de autenticação e controles de acesso;
- revisar possíveis riscos de segurança;
- depurar erros e validar alterações com builds e verificações do projeto.

Foi utilizado o **GitHub Copilot CLI** como ambiente de assistência durante o
processo. O uso de IA foi complementar à revisão técnica humana e não substitui
a validação, os testes e a responsabilidade do desenvolvedor pelo código
entregue.

### Configuração segura por padrão

- `DEBUG` assume `False` quando não configurado.
- O CORS não permite todas as origens por padrão; origens explícitas devem ser
  configuradas em `CORS_ALLOWED_ORIGINS`.
- A chave secreta não utiliza mais uma chave fixa de desenvolvimento como
  fallback. Quando `DJANGO_SECRET_KEY` não é informada, uma chave aleatória é
  gerada para a execução atual.
- Em desenvolvimento, `ALLOWED_HOSTS` é limitado a `localhost`, `127.0.0.1`,
  `backend` e `0.0.0.0`. Os valores de produção serão fornecidos pelo ambiente
  de CI/CD.


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

### Exportar o Schema GraphQL
```bash
docker compose exec backend python projeto_aplicado/manage.py graphql_schema \
  --schema praticas_de_mercado.schema.schema \
  --out frontend/graphql-schema.json
```

### Atualizar os tipos GraphQL do Frontend
Depois de exportar o schema, gere os tipos e operações TypeScript no container do frontend:
```bash
docker compose exec frontend npm run update-types -- graphql-schema.json
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
