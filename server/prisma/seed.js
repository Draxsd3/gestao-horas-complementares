require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const alunoTeste = {
    nome: 'Aluno Teste',
    email: 'aluno@teste.com',
    senha: '123456',
    role: 'ALUNO'
  };

  const grupos = [
    { numero: 1, horasMaximas: 20, descricao: 'InformaÃ§Ãµes sobre a Ã¡rea profissional, carreiras, vagas, remuneraÃ§Ã£o e currÃ­culo.' },
    { numero: 2, horasMaximas: 20, descricao: 'Narrativas de trajetÃ³rias profissionais e superaÃ§Ã£o de dificuldades no setor.' },
    { numero: 3, horasMaximas: 15, descricao: 'Metodologias Ãgeis, crÃ­tica construtiva e autocrÃ­tica no processo de projetos.' },
    { numero: 4, horasMaximas: 15, descricao: 'Design Thinking e modelos lÃ³gicos de resoluÃ§Ã£o de problemas.' },
    { numero: 5, horasMaximas: 30, descricao: 'InteraÃ§Ã£o com profissionais do setor no desenvolvimento de projetos.' },
    { numero: 6, horasMaximas: 10, descricao: 'Ã‰tica profissional, procedimentos corretos e boas prÃ¡ticas no ambiente de trabalho.' },
    { numero: 7, horasMaximas: 15, descricao: 'Softwares e soluÃ§Ãµes para seguranÃ§a de processos e informaÃ§Ãµes.' },
    { numero: 8, horasMaximas: 40, descricao: 'Novas tecnologias: Cloud, IA, IoT, Big Data, ML, RobÃ³tica e AutomaÃ§Ã£o.' },
    { numero: 9, horasMaximas: 15, descricao: 'Impacto dos processos 4.0 na Ã¡rea de Desenvolvimento de Sistemas.' },
    { numero: 10, horasMaximas: 20, descricao: 'Desenvolvimento de soluÃ§Ãµes pensadas no usuÃ¡rio (UX/UI) desde a concepÃ§Ã£o.' }
  ];

  console.log('Garantindo usuario aluno de teste no banco...');

  await prisma.usuario.upsert({
    where: { email: alunoTeste.email },
    update: {
      nome: alunoTeste.nome,
      senha: alunoTeste.senha,
      role: alunoTeste.role
    },
    create: alunoTeste
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
