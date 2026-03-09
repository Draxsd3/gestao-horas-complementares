const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const grupos = [
    { numero: 1, horasMaximas: 20, descricao: "Informações sobre a área profissional, carreiras, vagas, remuneração e currículo." },
    { numero: 2, horasMaximas: 20, descricao: "Narrativas de trajetórias profissionais e superação de dificuldades no setor." },
    { numero: 3, horasMaximas: 15, descricao: "Metodologias Ágeis, crítica construtiva e autocrítica no processo de projetos." },
    { numero: 4, horasMaximas: 15, descricao: "Design Thinking e modelos lógicos de resolução de problemas." },
    { numero: 5, horasMaximas: 30, descricao: "Interação com profissionais do setor no desenvolvimento de projetos." },
    { numero: 6, horasMaximas: 10, descricao: "Ética profissional, procedimentos corretos e boas práticas no ambiente de trabalho." },
    { numero: 7, horasMaximas: 15, descricao: "Softwares e soluções para segurança de processos e informações." },
    { numero: 8, horasMaximas: 40, descricao: "Novas tecnologias: Cloud, IA, IoT, Big Data, ML, Robótica e Automação." },
    { numero: 9, horasMaximas: 15, descricao: "Impacto dos processos 4.0 na área de Desenvolvimento de Sistemas." },
    { numero: 10, horasMaximas: 20, descricao: "Desenvolvimento de soluções pensadas no usuário (UX/UI) desde a concepção." },
  ];
  console.log("Colocando os 10 grupos no Banco!");

  for (const g of grupos) {
    await prisma.grupo.upsert({
        where: { numero: g.numero },
        update: {},
        create: g
    });
  }

  console.log("Grupos cadastrados com sucesso!");
}

main()
    .catch((e) =>{
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });