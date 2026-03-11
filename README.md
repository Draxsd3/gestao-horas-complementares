# Gestao de Horas Complementares

<p align="center">
  Plataforma full stack para gestao de horas complementares, com fluxo de envio por alunos e analise operacional por professores.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-336791?logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="TailwindCSS">
</p>

## Visao Geral

O **Gestao de Horas Complementares** e uma aplicacao web voltada para instituicoes de ensino que precisam:

- registrar alunos e professores por perfil
- organizar horas complementares por grupos/categorias
- receber certificados com upload de arquivo
- acompanhar horas aprovadas e pendencias
- validar, rejeitar e reenquadrar certificados enviados

O sistema separa claramente os fluxos de:

- **Aluno**: acompanha progresso, envia certificados e consulta seu perfil
- **Professor**: cadastra alunos, analisa certificados e valida horas

## Destaques Tecnicos

- Frontend SPA com React, Vite e React Router
- Consumo de dados com cache e sincronizacao via TanStack Query
- Backend REST com Express e organizacao centrada em rotas de aluno e professor
- Prisma ORM com migrations versionadas e seed inicial
- Modelagem relacional com vinculo professor-aluno
- Upload local de certificados com `multer`
- Interface responsiva com navegacao mobile e atalhos por contexto
- Deploy preparado para **Vercel** no frontend e **Render** no backend

## Tecnologias Utilizadas

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
- multer
- cors
- dotenv

### Banco de Dados

- PostgreSQL
- Supabase

### Infra e Deploy

- Vercel
- Render

## Funcionalidades Principais

- Login por perfil
- Dashboard do aluno com resumo de certificados
- Visualizacao de progresso por grupos de horas
- Envio de certificado com PDF ou imagem
- Perfil do aluno com imagem local em `localStorage`
- Dashboard do professor com indicadores operacionais
- Cadastro de alunos pelo professor
- Listagem compacta e pesquisavel de alunos
- Analise de certificados com aprovacao, rejeicao e observacao
- Validacao parcial de horas (`horasValidadas`)

## Arquitetura do Projeto

```text
gestao-horas-complementares/
|-- client/
|   |-- public/
|   |-- src/
|   |   |-- api/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- pages/
|   |   `-- utils/
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

## Modulos do Sistema

### Aluno

- `/dashboard`
- `/grupos`
- `/enviar`
- `/perfil`

### Professor

- `/professor`
- `/professor/alunos`
- `/professor/certificados`

## Estrutura de Dados

### Usuario

- `role`: `ALUNO` ou `PROFESSOR`
- professor pode possuir varios alunos vinculados
- aluno envia certificados
- professor pode analisar certificados

### Grupo

- representa uma categoria de horas complementares
- possui `numero`, `descricao` e `horasMaximas`

### Certificado

- pertence a um aluno
- pertence a um grupo
- possui status `PENDENTE`, `APROVADO` ou `REJEITADO`
- pode armazenar `horasValidadas`
- pode receber `observacaoProfessor`

## Endpoints Relevantes

### Base

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

## Como Executar Localmente

### Pre-requisitos

- Node.js 18+
- npm
- PostgreSQL local ou remoto
- Git

### 1. Clone o repositorio

```bash
git clone <url-do-repositorio>
cd gestao-horas-complementares
```

### 2. Configure o backend

```bash
cd server
npm install
```

Crie `server/.env`:

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/banco?schema=public"
PORT=3001
```

Para Supabase com pooler:

```env
DATABASE_URL="postgresql://postgres.<project-ref>:<db-password>@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
PORT=3001
```

### 3. Gere o Prisma Client e aplique as migrations

```bash
npm run build
npx prisma migrate deploy
```

Para ambiente local de desenvolvimento, tambem pode usar:

```bash
npx prisma migrate dev
```

### 4. Popule o banco com dados iniciais

```bash
npx prisma db seed
```

### 5. Configure o frontend

```bash
cd ../client
npm install
```

Crie `client/.env`:

```env
VITE_API_URL="http://localhost:3001"
```

### 6. Rode o projeto

Backend:

```bash
cd server
npm run start
```

Frontend:

```bash
cd client
npm run dev
```

## Credenciais de Demonstracao

Criadas pelo seed:

- `professor@teste.com` / `123456`
- `aluno@teste.com` / `123456`

## Scripts Disponiveis

### Backend

- `npm run dev`
- `npm run start`
- `npm run build`
- `npm run render-build`

### Frontend

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

## Uploads e Armazenamento

No estado atual, os arquivos de certificados sao armazenados localmente em:

```text
server/uploads/
```

Formatos aceitos:

- PDF
- JPG
- JPEG
- PNG
- WEBP

Observacao:

- para producao, o ideal e mover o upload para um storage dedicado

## Deploy

### Frontend na Vercel

Configuracao recomendada:

- Root Directory: `client`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Variavel de ambiente:

```env
VITE_API_URL="https://seu-backend.onrender.com"
```

### Backend no Render

Configuracao recomendada:

- Root Directory: `server`
- Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
- Start Command: `node index.js`

Variaveis:

- `DATABASE_URL`
- `PORT` opcional

## Qualidade e Organizacao

- frontend com componentes compartilhados e paginas separadas por perfil
- backend com Prisma e migrations versionadas
- seed de banco para ambiente de demonstracao
- rotas separadas por responsabilidade
- interface mobile com menu hamburger e atalhos contextuais

## Melhorias Futuras

- hash de senha e autenticacao mais robusta
- JWT e controle de sessao real
- storage externo para arquivos
- filtros avancados em certificados
- relatorios exportaveis
- testes automatizados

## Observacoes Importantes

- o projeto usa senha em texto puro apenas para fins educacionais
- antes de producao, o fluxo de autenticacao precisa ser endurecido
- o backend depende de consistencia entre `schema.prisma`, migrations e `prisma generate`

## Licenca

Projeto de uso educacional.
