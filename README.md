# Gestao de Horas Complementares

<p align="center">
  Plataforma web para instituicoes de ensino organizarem o envio, a analise e a validacao de horas complementares de forma clara, acompanhavel e centralizada.
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

O **Gestao de Horas Complementares** foi pensado para escolas que precisam acompanhar atividades extracurriculares de seus alunos com mais previsibilidade, menos retrabalho e melhor rastreabilidade.

Em vez de concentrar o processo em planilhas soltas, e-mails e conferencias manuais, o sistema organiza tudo em um fluxo unico:

- o aluno envia o comprovante
- o professor analisa o documento
- o sistema registra a decisao
- as horas validadas passam a compor o progresso do aluno por grupo

O resultado e um ambiente em que a instituicao consegue enxergar:

- quem enviou certificados
- o que ainda esta pendente
- quais horas ja foram aprovadas
- em qual grupo cada atividade foi contabilizada
- quais observacoes foram registradas durante a analise

## Proposta do Sistema

O projeto atende uma necessidade comum em instituicoes de ensino tecnico e profissionalizante: controlar horas complementares sem perder transparencia para o aluno nem controle pedagogico para a equipe responsavel.

O sistema foi desenhado para:

- reduzir erros no lancamento de horas
- centralizar comprovantes em um unico ambiente
- permitir acompanhamento por perfil de acesso
- facilitar a organizacao por categorias de horas
- dar visibilidade ao historico de decisao sobre cada certificado

## Como Funciona na Pratica

### 1. Vinculo entre professor e alunos

Cada aluno pode ser vinculado a um professor responsavel. Esse professor passa a acompanhar a base de alunos sob sua orientacao e realiza a analise dos certificados enviados.

### 2. Organizacao por grupos de horas

As horas complementares sao divididas em grupos com:

- numero identificador
- descricao da categoria
- carga horaria maxima

Isso permite que a instituicao mantenha regras claras sobre o aproveitamento de cada tipo de atividade.

### 3. Envio de comprovantes pelo aluno

O aluno envia:

- titulo da atividade
- quantidade de horas solicitadas
- grupo relacionado
- comprovante em arquivo

O envio fica registrado com status inicial de **pendente**.

### 4. Analise pedagogica

O professor pode:

- aprovar o certificado
- rejeitar o certificado
- reenquadrar o grupo da atividade
- definir as horas efetivamente validadas
- registrar observacoes

### 5. Atualizacao do progresso

Quando um certificado e aprovado:

- o total validado passa a compor o progresso do aluno
- o grupo correspondente e atualizado
- o historico continua visivel para consulta posterior

## Perfis de Uso

### Aluno

O aluno acessa um ambiente voltado para acompanhamento individual.

Principais recursos:

- painel com resumo de certificados
- visualizacao do progresso por grupos de horas
- envio de novos comprovantes
- consulta da propria lista de certificados
- abertura do comprovante enviado
- leitura das observacoes feitas pelo professor
- visualizacao dos certificados aprovados dentro de cada grupo

### Professor

O professor acessa um ambiente de operacao e acompanhamento da turma.

Principais recursos:

- painel com indicadores gerais
- cadastro manual de alunos
- importacao de alunos por planilha
- listagem pesquisavel da base vinculada
- analise de certificados recebidos
- validacao parcial ou total de horas
- registro de observacoes pedagogicas

## Funcionalidades Atuais

- login por perfil
- painel do aluno com resumo de situacao
- painel do professor com visao operacional
- cadastro de alunos com vinculo ao professor
- importacao de alunos por planilha `.xlsx`, `.xls` ou `.csv`
- envio de certificados com PDF ou imagem
- listagem de certificados do aluno
- analise de certificados pelo professor
- aprovacao, rejeicao e reenquadramento de grupo
- controle de horas validadas
- visualizacao de certificados aprovados por grupo
- armazenamento persistente dos comprovantes

## Fluxos Principais

### Fluxo do Aluno

1. O aluno entra no sistema.
2. Consulta o painel com o resumo da propria situacao.
3. Envia um novo certificado para analise.
4. Acompanha o status do envio.
5. Verifica horas aprovadas e certificados por grupo.

### Fluxo do Professor

1. O professor acessa o painel institucional.
2. Cadastra alunos manualmente ou por planilha.
3. Consulta a lista de alunos vinculados.
4. Abre a fila de certificados recebidos.
5. Analisa cada comprovante e registra a decisao.

## Regras de Negocio Ja Aplicadas

- o sistema distingue perfis de `ALUNO` e `PROFESSOR`
- o aluno entra vinculado a um professor
- cada certificado pertence a um aluno e a um grupo
- o professor so analisa certificados dos alunos sob sua responsabilidade
- as horas validadas nao podem exceder as horas solicitadas
- o certificado pode ficar em `PENDENTE`, `APROVADO` ou `REJEITADO`
- o progresso do aluno considera apenas certificados aprovados
- a importacao de planilha valida colunas obrigatorias, serie e duplicidade de e-mail

## Experiencia de Uso

O projeto foi construido com foco em clareza operacional e leitura rapida.

Alguns pontos importantes da experiencia:

- navegacao separada por perfil
- cards e indicadores para leitura imediata
- filtros e buscas nas telas operacionais
- uso de status visuais para pendencias, aprovacoes e rejeicoes
- acesso direto aos comprovantes
- feedback de importacao com resumo e ocorrencias por linha

## Estrutura Funcional do Projeto

```text
gestao-horas-complementares/
|-- client/
|   |-- src/
|   |   |-- api/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- pages/
|   |   `-- utils/
|   `-- vercel.json
|
|-- server/
|   |-- prisma/
|   |   |-- migrations/
|   |   |-- schema.prisma
|   |   `-- seed.js
|   `-- index.js
|
`-- README.md
```

## Estrutura Conceitual dos Dados

### Usuario

- representa aluno ou professor
- controla nome, e-mail, serie e perfil
- permite relacao entre professor e alunos

### Grupo

- representa a categoria de horas complementares
- define descricao e limite maximo de horas

### Certificado

- registra o envio feito pelo aluno
- guarda status da analise
- armazena comprovante e metadados
- registra grupo, horas solicitadas e horas validadas

## Importacao por Planilha

O modulo de importacao foi pensado para atender turmas maiores.

Formato esperado:

- `nome`
- `email`
- `serie`
- `senha`

Series aceitas:

- `1a Serie`
- `2a Serie`
- `3a Serie`

Ao final da importacao, o sistema retorna:

- total de linhas lidas
- quantos alunos foram criados
- quantos registros foram ignorados
- lista de ocorrencias para correcao

## Contexto de Uso Institucional

Este projeto pode ser utilizado como base para:

- escolas tecnicas
- cursos profissionalizantes
- coordenacoes pedagogicas
- controle de atividades complementares por turma
- acompanhamento de carga horaria extracurricular por aluno

Ele foi estruturado para favorecer:

- transparencia
- rastreabilidade
- organizacao por responsabilidades
- consulta historica das decisoes

## Base Tecnologica

### Frontend

- React
- Vite
- React Router
- TanStack Query
- Axios
- Tailwind CSS

### Backend

- Node.js
- Express
- Prisma ORM
- multer
- xlsx

### Banco de Dados

- PostgreSQL

## Evolucao do Produto

O sistema ja cobre o fluxo principal institucional, mas ainda pode evoluir em frentes como:

- autenticacao mais robusta
- relatorios gerenciais
- exportacao de dados
- trilha de auditoria mais detalhada
- notificacoes de pendencias
- dashboards por coordenacao ou curso

## Observacoes

- o projeto foi pensado para uso educacional e institucional
- o fluxo atual privilegia clareza operacional e demonstracao funcional
- a arquitetura separa bem os modulos de aluno, professor, grupos e certificados

## Licenca

Projeto de uso educacional.
