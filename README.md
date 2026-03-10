# 🚀 Sistema de Gestão de Horas Complementares

Sistema **Fullstack** para gerenciamento de **horas complementares acadêmicas**, onde alunos podem enviar certificados e acompanhar seu progresso de horas em diferentes categorias através de **barras de progresso dinâmicas**.

O sistema permite:

* 📄 Envio de certificados
* ⏳ Avaliação de certificados
* 📊 Acompanhamento de progresso por categoria
* 👤 Sistema de autenticação de usuários

---

# 🛠️ Tecnologias Utilizadas

## 🎨 Frontend

* React (Vite)
* Tailwind CSS
* React Router DOM
* React Query (TanStack Query)
* Lucide React

## ⚙️ Backend

* Node.js
* Express
* Prisma ORM
* Multer (upload de arquivos)
* CORS

## 🗄️ Banco de Dados

* PostgreSQL
* Prisma Studio

---

# 📋 Pré-requisitos

Antes de rodar o projeto, você precisa ter instalado:

* Node.js **v18 ou superior**
* PostgreSQL
* Git

Verifique se está tudo instalado:

```bash
node -v
npm -v
psql --version
```

---

# 📁 Estrutura do Projeto

```
horas-complementares/
│
├── client/          # Frontend React + Vite
│
├── server/          # Backend Node + Express
│   ├── prisma/      # Schema e migrations
│   ├── uploads/     # Arquivos enviados
│   └── index.js     # Servidor principal
│
└── README.md
```

---

# ⚙️ Configuração do Backend

Entre na pasta do servidor:

```bash
cd server
```

Instale as dependências:

```bash
npm install
```

---

# 🔐 Variáveis de Ambiente

Crie um arquivo `.env` dentro da pasta **server**.

Exemplo:

```
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/NOME_DO_BANCO?schema=public"
PORT=3001
```

---

# 🗄️ Criar Banco e Rodar Migrations

Execute o comando:

```bash
npx prisma migrate dev --name init
```

Esse comando irá:

* Criar as tabelas no banco
* Aplicar as migrations
* Gerar o Prisma Client

---

# 📂 Criar Pasta de Uploads

O sistema salva os certificados enviados pelos alunos.

Crie a pasta:

```bash
mkdir uploads
```

---

# ▶️ Rodar o Backend

```bash
node index.js
```

O servidor ficará disponível em:

```
http://localhost:3001
```

Teste acessando no navegador:

```
http://localhost:3001
```

Resposta esperada:

```
Servidor voando!
```

---

# 🎨 Rodando o Frontend

Entre na pasta do frontend:

```bash
cd client
```

Instale as dependências:

```bash
npm install
```

Execute o projeto:

```bash
npm run dev
```

O frontend estará disponível em:

```
http://localhost:5173
```

---

# 🔄 Comunicação Frontend ↔ Backend

Frontend roda em:

```
localhost:5173
```

Backend roda em:

```
localhost:3001
```

O **CORS** está habilitado para permitir a comunicação entre ambos.

---

# 📄 Rotas da API

## Cadastro de usuário

```
POST /cadastro
```

Body:

```json
{
 "nome": "Samuel",
 "email": "samuel@email.com",
 "senha": "123456"
}
```

---

## Login

```
POST /login
```

---

## Listar grupos

```
GET /grupos
```

Retorna todas as categorias de horas.

---

## Progresso do aluno

```
GET /grupos-progresso/:alunoId
```

Retorna o progresso de horas aprovadas por grupo.

---

## Enviar certificado

```
POST /enviar-certificado
```

Upload contendo:

* título
* horas
* alunoId
* grupoId
* arquivo

Os arquivos enviados ficam salvos em:

```
/uploads
```

---

# 🧪 Prisma Studio

Interface visual para gerenciar o banco de dados.

Execute:

```bash
npx prisma studio
```

Abrirá em:

```
http://localhost:5555
```

Permite:

* visualizar usuários
* editar registros
* aprovar certificados

---

# 🔒 Status dos Certificados

Cada certificado possui um status:

| Status    | Significado          |
| --------- | -------------------- |
| PENDENTE  | Aguardando avaliação |
| APROVADO  | Horas contabilizadas |
| REJEITADO | Certificado inválido |

---

# 📊 Dashboard

O painel do aluno permite:

* visualizar progresso de horas
* acompanhar certificados aprovados
* enviar novos certificados

Interface desenvolvida com:

* Tailwind CSS
* React Query
* Lucide Icons

---

# 🚀 Melhorias Futuras

* Autenticação com JWT
* Sistema de aprovação para professores
* Upload para storage externo (S3 ou Cloudinary)
* Notificações para certificados aprovados
* Dashboard administrativo

---

# 📜 Licença

Este projeto foi desenvolvido para fins educacionais.
