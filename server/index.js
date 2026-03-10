require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const uploadsDir = path.join(__dirname, 'uploads');
const allowedFileTypes = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg'
]);

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

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
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // nome do arquivo: data do envio - nome original do arquivo
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (allowedFileTypes.has(file.mimetype)) {
            cb(null, true);
            return;
        }

        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'arquivo'));
    }
});
app.use('/uploads', express.static(uploadsDir));

app.post('/enviar-certificado', (req, res, next) => {
    upload.single('arquivo')(req, res, (error) => {
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ error: "Envie apenas arquivos PDF ou imagem." });
        }

        if (error) {
            return res.status(400).json({ error: "Erro ao processar arquivo enviado." });
        }

        next();
    });
}, async (req, res) => {
    const { titulo, horas, alunoId, grupoId } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: "O arquivo do certificado Ã© obrigatÃ³rio." });
    }

    const arquivoUrl = req.file.path;

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

app.get('/certificados-resumo/:alunoId', async (req, res) => {
    const { alunoId } = req.params;

    try {
        const certificados = await prisma.certificado.findMany({
            where: {
                alunoId: Number(alunoId)
            },
            select: {
                status: true
            }
        });

        const resumo = certificados.reduce((acc, certificado) => {
            if (certificado.status === 'PENDENTE') acc.emAnalise += 1;
            if (certificado.status === 'APROVADO') acc.aprovados += 1;
            if (certificado.status === 'REJEITADO') acc.reprovados += 1;
            return acc;
        }, {
            emAnalise: 0,
            aprovados: 0,
            reprovados: 0,
            total: certificados.length
        });

        res.json(resumo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao carregar resumo dos certificados." });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
})
