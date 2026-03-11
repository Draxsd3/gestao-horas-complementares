# Gestao de Horas Complementares

Sistema full stack para controle de horas complementares academicas, com fluxo separado para alunos e professores.

O projeto permite:
- cadastro e login por perfil
- envio de certificados pelo aluno
- acompanhamento de progresso por grupo de horas
- analise, validacao e rejeicao de certificados pelo professor
- cadastro de alunos vinculado ao professor

## Visao Geral

O sistema foi construido para digitalizar o processo de horas complementares dentro de um contexto escolar. O aluno envia comprovantes e acompanha seu progresso. O professor recebe os certificados, valida a carga horaria aceita, registra observacoes e organiza sua base de alunos em um painel separado.

## Principais Modulos

### Aluno
- login
- dashboard com resumo de horas e status dos certificados
- visualizacao dos grupos de horas
- envio de certificado com arquivo PDF ou imagem
- perfil do usuario

### Professor
- dashboard com indicadores consolidados
- cadastro e vinculacao de alunos
- listagem compacta e pesquisavel de alunos
- fila de analise de certificados
- validacao de horas, troca de grupo e observacao do professor

## Stack Tecnologica

### Frontend
- React 19
- Vite
- React Router DOM
- TanStack Query
- Axios
- Tailwind CSS 4
- Lucide React

### Backend
- Node.js
- Express
- Prisma ORM
- Multer
- CORS
- dotenv

### Banco de dados
- PostgreSQL
- Supabase

### Deploy
- Frontend: Vercel
- Backend: Render
- Banco: Supabase

## Arquitetura do Projeto

```text
gestao-horas-complementares/
|-- client/
|   |-- public/
|   |-- src/
|   |   |-- api/
|   |   |-- assets/
|   |   |-- components/
|   |   `-- pages/
|   |-- package.json
|   `-- vercel.json
|
|-- server/
|   |-- prisma/
|   |   |-- migrations/
|   |   |-- schema.prisma
|   |   `-- seed.js
|   |-- uploads/
|   |-- index.js
|   `-- package.json
|
`-- README.md
```

## Tecnologias por Camada

| Camada | Responsabilidade | Tecnologias |
|---|---|---|
| Frontend | Interface e navegacao | React, Vite, React Router, Tailwind |
| Estado assinc | Consumo e cache de dados | TanStack Query, Axios |
| Backend | API REST e upload | Express, Multer |
| Persistencia | Modelagem e acesso a dados | Prisma |
| Banco | Usuarios, grupos e certificados | PostgreSQL / Supabase |
| Deploy | Hospedagem | Vercel + Render |

## Modelagem Principal

### Usuario
- `ALUNO` ou `PROFESSOR`
- professor pode possuir varios alunos vinculados
- aluno envia certificados
- professor pode analisar certificados

### Grupo
- agrupa categorias de horas complementares
- possui limite maximo de horas por categoria

### Certificado
- pertence a um aluno
- pertence a um grupo
- pode ser `PENDENTE`, `APROVADO` ou `REJEITADO`
- pode ter `horasValidadas`
- pode ter `observacaoProfessor`

## Rotas do Frontend

### Publicas
- `/` login

### Aluno
- `/dashboard`
- `/grupos`
- `/enviar`
- `/perfil`

### Professor
- `/professor`
- `/professor/alunos`
- `/professor/certificados`

## API Principal

### Autenticacao e base geral
- `POST /cadastro`
- `POST /login`
- `GET /grupos`

### Aluno
- `POST /enviar-certificado`
- `GET /grupos-progresso/:alunoId`
- `GET /certificados-resumo/:alunoId`

### Professor
- `GET /professor/dashboard/:professorId`
- `GET /professor/alunos/:professorId`
- `POST /professor/alunos`
- `GET /professor/certificados/:professorId`
- `PATCH /professor/certificados/:certificadoId`

## Pre-requisitos

- Node.js 18 ou superior
- npm
- PostgreSQL ou acesso a um banco PostgreSQL remoto
- Git

## Variaveis de Ambiente

### Backend

Crie `server/.env`:

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/banco?schema=public"
PORT=3001
```

Se estiver usando Supabase com pooler, a URL normalmente segue este formato:

```env
DATABASE_URL="postgresql://postgres.<project-ref>:<db-password>@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
PORT=3001
```

### Frontend

Crie `client/.env`:

```env
VITE_API_URL="http://localhost:3001"
```

## Instalacao Local

### 1. Clonar o repositorio

```bash
git clone <url-do-repositorio>
cd gestao-horas-complementares
```

### 2. Instalar dependencias do backend

```bash
cd server
npm install
```

### 3. Instalar dependencias do frontend

```bash
cd ../client
npm install
```

## Banco de Dados

### Gerar o Prisma Client

```bash
cd server
npm run build
```

### Aplicar migrations

```bash
npx prisma migrate deploy
```

Para desenvolvimento local, tambem pode ser usado:

```bash
npx prisma migrate dev
```

### Popular com dados iniciais

```bash
npx prisma db seed
```

O seed cria:
- 10 grupos de horas
- 1 professor de teste
- 1 aluno de teste vinculado a esse professor

Credenciais de seed:

```text
Professor
email: professor@teste.com
senha: 123456

Aluno
email: aluno@teste.com
senha: 123456
```

## Executando o Projeto

### Backend

```bash
cd server
npm run start
```

API local:

```text
http://localhost:3001
```

### Frontend

```bash
cd client
npm run dev
```

App local:

```text
http://localhost:5173
```

## Scripts Disponiveis

### `server/package.json`

- `npm run dev` inicia o backend com nodemon
- `npm run start` inicia o backend em modo normal
- `npm run build` gera o Prisma Client
- `npm run render-build` gera o Prisma Client e aplica migrations no deploy

### `client/package.json`

- `npm run dev` inicia o frontend com Vite
- `npm run build` gera o bundle de producao
- `npm run preview` serve o build localmente
- `npm run lint` valida o frontend com ESLint

## Uploads

Os certificados sao enviados para a pasta local `server/uploads/`.

Formatos aceitos:
- PDF
- JPG
- JPEG
- PNG
- WEBP

Observacao:
- no estado atual, o upload e local ao servidor
- para producao, o ideal e migrar esse fluxo para um storage dedicado

## Deploy

### Backend no Render

Configuracao recomendada:
- Root Directory: `server`
- Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
- Start Command: `node index.js`

Variaveis:
- `DATABASE_URL`
- `PORT` opcional

### Frontend na Vercel

Configuracao recomendada:
- Root Directory: `client`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Variavel:

```env
VITE_API_URL="https://seu-backend.onrender.com"
```

## Interface

O frontend foi estruturado com foco em:
- navegacao separada por perfil
- dashboard de aluno com atalhos mobile
- painel do professor dividido em telas de alunos e certificados
- menu mobile com atalho de perfil
- layout responsivo para desktop e dispositivos menores

## Melhorias Futuras

- autenticacao com hash de senha e JWT
- storage externo para certificados
- historico mais detalhado de analises
- filtros avancados por periodo, grupo e status
- exportacao de relatorios

## Observacoes

- o projeto hoje usa senha em texto puro apenas para fins educacionais
- antes de usar em producao, o fluxo de autenticacao precisa ser endurecido
- o backend depende da consistencia entre `schema.prisma`, migrations e `prisma generate`

## Licenca

Projeto de uso educacional.
