# ParacuruVeiculos - MVP

Sistema profissional de anúncio de veículos.

## Tecnologias
- **Frontend**: React + HTML + CSS + Javascript (No Build Tools, via CDN)
- **Backend**: Node.js + Express
- **Database**: MariaDB + Sequelize
- **Auth**: JWT + Bcrypt
- **Pagamentos**: Mercado Pago

## Estrutura
- `/backend`: Código do servidor Node.js
- `/public`: Frontend (Static Files served by Node)
- `/database`: Scripts SQL

## Configuração

### 1. Banco de Dados
Certifique-se de ter o MariaDB rodando.
Crie o banco de dados e as tabelas rodando o script:
`database/schema.sql`

Isso criará o banco `paracuru_db` e as tabelas e dados iniciais.

### 2. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo (ajuste conforme necessário):

```env
PORT=3000
DB_NAME=butique_db
DB_USER=root
DB_PASS=root
DB_HOST=localhost
JWT_SECRET=super_secret_jwt_key
MP_ACCESS_TOKEN=

BASE_URL=http://localhost:3003
```
*Substitua `MP_ACCESS_TOKEN` pelo seu token de teste do Mercado Pago.*

### 3. Instalação e Execução

Instale as dependências:
```bash
npm install
```

Inicie o servidor:
```bash
node backend/server.js
```

Acesse no navegador:
`http://localhost:3003`

## Funcionalidades
- **Auth**: Registro e Login de usuários.
- **Anúncios**: Criar anúncios com fotos (upload múltiplo), busca por filtros.
- **Pagamentos**: Integração Checkout Pro Mercado Pago.
- **Admin**: Painel administrativo em `/admin` (Login separado na tabela `admin_users`).

Para inicializar o servidor, você pode usar um dos seguintes comandos no terminal, dentro da pasta raiz do projeto (ParacuruVeiculos):

Modo de Desenvolvimento (recomendado):
npm run dev

Este comando usa o nodemon, que reinicia o servidor automaticamente sempre que você salva uma alteração nos arquivos.
Modo Padrão:
npm start

Este comando roda o servidor com o node simples.
