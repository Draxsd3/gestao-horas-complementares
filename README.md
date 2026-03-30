# Gestão de Horas Complementares — Centro Paula Souza

> Plataforma web para controle de horas complementares em instituições
> de ensino técnico: envio de comprovantes, análise pedagógica e
> acompanhamento de progresso por perfil de acesso.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat-square&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/Uso-Educacional-blue?style=flat-square)

---

## Sobre o Projeto

Desenvolvido como solução para o **Centro Paula Souza**, o sistema
substitui planilhas e e-mails no controle de horas complementares,
centralizando o fluxo em uma plataforma com perfis, rastreabilidade
e histórico de decisões pedagógicas.

O aluno envia o comprovante. O professor analisa e decide.
O sistema registra tudo — aprovações, rejeições, observações e progresso.

---

## Fluxo Principal
```
Aluno envia comprovante
        │
        ▼
  Status: PENDENTE
        │
        ▼
Professor analisa
        │
   ┌────┴────┐
   ▼         ▼
APROVADO  REJEITADO
   │
   ▼
Horas validadas somam
ao progresso do aluno
por grupo de atividade
```

---

## Perfis e Responsabilidades

### Aluno
- Painel com resumo de situação e progresso por grupo
- Envio de certificados (PDF ou imagem)
- Acompanhamento de status e observações do professor
- Visualização de horas aprovadas por categoria

### Professor
- Painel operacional com indicadores da turma
- Cadastro manual de alunos ou importação por planilha
- Fila de certificados para análise
- Aprovação, rejeição ou reenquadramento de grupo
- Registro de observações pedagógicas e horas validadas

---

## Funcionalidades

| Módulo | Funcionalidades |
|---|---|
| **Auth** | Login por perfil (ALUNO / PROFESSOR) |
| **Alunos** | Cadastro manual, importação por planilha `.xlsx/.xls/.csv` |
| **Certificados** | Envio com comprovante, análise, aprovação/rejeição, reenquadramento |
| **Grupos** | Categorias de horas com limite máximo configurável |
| **Progresso** | Cálculo automático por grupo com base em certificados aprovados |
| **Importação** | Validação de colunas, série, duplicidade — relatório de ocorrências |

---

## Regras de Negócio

- Aluno é sempre vinculado a um professor responsável
- Professor analisa apenas certificados dos seus alunos
- Horas validadas não podem exceder as horas solicitadas
- Progresso considera apenas certificados com status `APROVADO`
- Importação de planilha valida obrigatoriedade de campos, série e e-mail duplicado
- Séries aceitas: `1a Serie`, `2a Serie`, `3a Serie`

---

## Arquitetura
```
gestao-horas-complementares/
├── client/
│   └── src/
│       ├── api/          # cliente HTTP e endpoints
│       ├── components/   # componentes reutilizáveis
│       ├── pages/        # telas por perfil
│       └── utils/        # helpers
└── server/
    ├── prisma/
    │   ├── migrations/   # histórico de schema
    │   ├── schema.prisma # modelos de dados
    │   └── seed.js       # dados iniciais
    └── index.js          # entry point Express
```

---

## Modelo de Dados

| Entidade | Responsabilidade |
|---|---|
| `Usuario` | Aluno ou professor — nome, e-mail, série, perfil, vínculo |
| `Grupo` | Categoria de horas — descrição e carga máxima |
| `Certificado` | Comprovante enviado — status, horas, grupo, arquivo, observações |

---

## Stack Tecnológica

### Frontend
- **React 19** com **Vite 7**
- **TanStack Query** — gerenciamento de estado assíncrono
- **Tailwind CSS 4** — estilização utilitária
- **Axios** — cliente HTTP
- **React Router** — navegação por perfil

### Backend
- **Node.js 18+** com **Express 5**
- **Prisma ORM** — modelagem e migrations PostgreSQL
- **Multer** — upload de comprovantes (PDF e imagem)
- **xlsx** — leitura e validação de planilhas

### Banco de Dados
- **PostgreSQL** via **Supabase**

---

## Como Executar Localmente

### Pré-requisitos
- Node.js 18+
- PostgreSQL local ou conta no Supabase

### 1. Clone o repositório
```bash
git clone https://github.com/Draxsd3/gestao-horas-complementares
cd gestao-horas-complementares
```

### 2. Configure o backend
```bash
cd server
npm install
cp .env.example .env
```

Variáveis principais em `server/.env`:
```
DATABASE_URL=postgresql://...
JWT_SECRET=
PORT=3333
```

### 3. Execute as migrations e o seed
```bash
npx prisma migrate dev
node prisma/seed.js
```

### 4. Inicie o backend
```bash
npm run dev
# API disponível em http://localhost:3333
```

### 5. Configure e inicie o frontend
```bash
cd ../client
npm install
npm run dev
# App disponível em http://localhost:5173
```

---

## Importação por Planilha

O módulo de importação processa turmas completas em lote.

**Formato esperado:**

| Campo | Obrigatório |
|---|---|
| `nome` | Sim |
| `email` | Sim |
| `serie` | Sim |
| `senha` | Sim |

**Ao final da importação o sistema retorna:**
- Total de linhas lidas
- Alunos criados com sucesso
- Registros ignorados
- Lista de ocorrências com descrição por linha

---

## Diferenciais Técnicos

- Separação clara de responsabilidades: cliente, servidor e banco independentes
- Prisma com migrations versionadas — schema rastreável e reversível
- Upload de comprovantes com Multer integrado ao fluxo de análise
- Importação de planilhas com validação de dados e relatório de erros
- Regras de negócio aplicadas no backend — progresso calculado server-side
- Controle de acesso por perfil em todas as rotas protegidas

---

## Roadmap

- [ ] Autenticação com refresh token
- [ ] Relatórios gerenciais por turma e curso
- [ ] Exportação de dados em PDF/Excel
- [ ] Trilha de auditoria detalhada por certificado
- [ ] Notificações de pendências para professor e aluno
- [ ] Dashboard por coordenação ou curso

---

## Contexto Institucional

Projeto desenvolvido como solução para escolas técnicas e
cursos profissionalizantes que precisam controlar atividades
complementares com rastreabilidade e transparência.

Aplicável a: escolas técnicas · cursos profissionalizantes ·
coordenações pedagógicas · controle por turma e série.

---

## Licença

Projeto de uso educacional.
