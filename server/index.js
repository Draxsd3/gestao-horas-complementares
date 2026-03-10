const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// verificar se o servidor esta rodando
app.get('/', (req, res) => {
    res.send('Servidor voando!');
});

app.get('/grupos', async (req, res) => {
    const grupos = await prisma.grupo.findMany({
        orderBy: { numero: 'asc' }
    });
    res.json(grupos);
});

// rotas do usuário
app.post('/cadastro', async (req, res) => {
    const { nome, email, senha, role } = req.body;

    try {
        const novoUsuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                senha,
                role: role || 'ALUNO'
            }
        });
        res.status(201).json(novoUsuario);
    } catch (error) {
        res.status(400).json({ error: "E-mail já cadastrado ou dados inválidos." });
    }
});

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    const usuario = await prisma.usuario.findUnique({
        where: { email }
    });

    if (usuario && usuario.senha === senha) {
        res.json({
            id: usuario.id,
            nome: usuario.nome,
            role: usuario.role
        });
    } else {
        res.status(401).json({ error: "Credenciais inválidas!" });
    }
});

// config de onde e como salvar os arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // nome do arquivo: data do envio - nome original do arquivo
    }
});

const upload = multer({ storage: storage });
app.use('/uploads', express.static('uploads'));

app.post('/enviar-certificado', upload.single('arquivo'), async (req, res) => {
    const { titulo, horas, alunoId, grupoId } = req.body;
    const arquivoUrl = req.file ? req.file.path : '';

    try {
        const novoCertificado = await prisma.certificado.create({
            data: {
                titulo,
                horas: Number(horas),
                alunoId: Number(alunoId),
                grupoId: Number(grupoId),
                arquivoUrl: arquivoUrl,
                status: 'PENDENTE' // Todo certificado nasce pendente para o professor avaliar
            }
        });
        res.status(201).json(novoCertificado);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Erro ao enviar certificado." });
    }
})

app.get('/grupos-progresso/:alunoId', async (req, res) => {
    const { alunoId } = req.params;

    try {
        const grupos = await prisma.grupo.findMany({
            orderBy: { numero: 'asc' },
            include: {
                certificados: {
                    where: {
                        alunoId: Number(alunoId),
                        status: 'APROVADO'
                    }
                }
            }
        });

        const progresso = grupos.map(grupo => {
            const horasAprovadas = grupo.certificados.reduce((soma, cert) => soma + cert.horas, 0);

            return {
                id: grupo.id,
                numero: grupo.numero,
                descricao: grupo.descricao,
                horasMaximas: grupo.horasMaximas,
                horasAprovadas: horasAprovadas || 0
            };
        });

        res.json(progresso);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao calcular progresso." });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
})