const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const professorTeste = {
    nome: 'Professor Teste',
    email: 'professor@teste.com',
    senha: '123456',
    role: 'PROFESSOR'
  };

  const alunoTeste = {
    nome: 'Aluno Teste',
    email: 'aluno@teste.com',
    senha: '123456',
    role: 'ALUNO'
  };

  const grupos = [
    { numero: 1, horasMaximas: 20, descricao: 'Informacoes sobre a area profissional, carreiras, vagas, remuneracao e curriculo.' },
    { numero: 2, horasMaximas: 20, descricao: 'Narrativas de trajetorias profissionais e superacao de dificuldades no setor.' },
    { numero: 3, horasMaximas: 15, descricao: 'Metodologias ageis, critica construtiva e autocritica no processo de projetos.' },
    { numero: 4, horasMaximas: 15, descricao: 'Design Thinking e modelos logicos de resolucao de problemas.' },
    { numero: 5, horasMaximas: 30, descricao: 'Interacao com profissionais do setor no desenvolvimento de projetos.' },
    { numero: 6, horasMaximas: 10, descricao: 'Etica profissional, procedimentos corretos e boas praticas no ambiente de trabalho.' },
    { numero: 7, horasMaximas: 15, descricao: 'Softwares e solucoes para seguranca de processos e informacoes.' },
    { numero: 8, horasMaximas: 40, descricao: 'Novas tecnologias: Cloud, IA, IoT, Big Data, ML, Robotica e Automacao.' },
    { numero: 9, horasMaximas: 15, descricao: 'Impacto dos processos 4.0 na area de Desenvolvimento de Sistemas.' },
    { numero: 10, horasMaximas: 20, descricao: 'Desenvolvimento de solucoes pensadas no usuario (UX/UI) desde a concepcao.' }
  ];

  console.log('Garantindo professor de teste no banco...');

  const professor = await prisma.usuario.upsert({
    where: { email: professorTeste.email },
    update: {
      nome: professorTeste.nome,
      senha: professorTeste.senha,
      role: professorTeste.role
    },
    create: professorTeste
  });

  console.log('Garantindo usuario aluno de teste no banco...');

  await prisma.usuario.upsert({
    where: { email: alunoTeste.email },
    update: {
      nome: alunoTeste.nome,
      senha: alunoTeste.senha,
      role: alunoTeste.role,
      professorId: professor.id
    },
    create: {
      ...alunoTeste,
      professorId: professor.id
    }
  });

  console.log('Colocando os 10 grupos no banco...');

  for (const grupo of grupos) {
    await prisma.grupo.upsert({
      where: { numero: grupo.numero },
      update: {},
      create: grupo
    });
  }

  console.log('Seed executado com sucesso!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
