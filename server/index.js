const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const fs = require('fs');

const app = express();

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL nao foi carregada. Verifique o arquivo server/.env.');
}

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
const certificateStatusWeight = {
    PENDENTE: 0,
    APROVADO: 1,
    REJEITADO: 2
};

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

function parseId(value) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizeEmail(email) {
    return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function normalizeSerie(serie) {
    const normalizedSerie = typeof serie === 'string' ? serie.trim() : '';
    return normalizedSerie || null;
}

function serializeCertificado(certificado) {
    return {
        ...certificado,
        arquivoUrl: `/uploads/${path.basename(certificado.arquivoUrl)}`
    };
}

async function buscarProfessor(professorId) {
    return prisma.usuario.findFirst({
        where: {
            id: professorId,
            role: 'PROFESSOR'
        }
    });
}

async function buscarUsuarioPorEmail(email) {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
        return null;
    }

    return prisma.usuario.findFirst({
        where: {
            email: {
                equals: normalizedEmail,
                mode: 'insensitive'
            }
        }
    });
}

app.get('/', (req, res) => {
    res.send('Servidor voando!');
});

app.get('/grupos', async (req, res) => {
    try {
        const grupos = await prisma.grupo.findMany({
            orderBy: { numero: 'asc' }
        });
        res.json(grupos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar grupos.' });
    }
});

app.post('/cadastro', async (req, res) => {
    const { nome, email, senha, role, professorId, serie } = req.body;
    const normalizedEmail = normalizeEmail(email);

    try {
        const usuarioExistente = await buscarUsuarioPorEmail(normalizedEmail);

        if (usuarioExistente) {
            return res.status(400).json({ error: 'E-mail ja cadastrado ou dados invalidos.' });
        }

        const novoUsuario = await prisma.usuario.create({
            data: {
                nome,
                email: normalizedEmail,
                serie: role === 'ALUNO' || !role ? normalizeSerie(serie) : null,
                senha,
                role: role || 'ALUNO',
                professorId: role === 'ALUNO' || !role ? parseId(professorId) : null
            }
        });

        res.status(201).json(novoUsuario);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'E-mail ja cadastrado ou dados invalidos.' });
    }
});

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await buscarUsuarioPorEmail(email);

        if (usuario && usuario.senha === senha) {
            res.json({
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                role: usuario.role,
                professorId: usuario.professorId
            });
            return;
        }

        res.status(401).json({ error: 'Credenciais invalidas!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao realizar login.' });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (allowedFileTypes.has(file.mimetype)) {
            cb(null, true);
            return;
        }

        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'arquivo'));
    }
});

app.post('/enviar-certificado', (req, res, next) => {
    upload.single('arquivo')(req, res, (error) => {
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ error: 'Envie apenas arquivos PDF ou imagem.' });
        }

        if (error) {
            return res.status(400).json({ error: 'Erro ao processar arquivo enviado.' });
        }

        next();
    });
}, async (req, res) => {
    const { titulo, horas, alunoId, grupoId } = req.body;
    const alunoIdNumerico = parseId(alunoId);
    const grupoIdNumerico = parseId(grupoId);

    if (!req.file) {
        return res.status(400).json({ error: 'O arquivo do certificado e obrigatorio.' });
    }

    if (!alunoIdNumerico || !grupoIdNumerico) {
        return res.status(400).json({ error: 'Aluno ou grupo invalido.' });
    }

    try {
        const aluno = await prisma.usuario.findFirst({
            where: {
                id: alunoIdNumerico,
                role: 'ALUNO'
            }
        });

        if (!aluno) {
            return res.status(404).json({ error: 'Aluno nao encontrado.' });
        }

        const novoCertificado = await prisma.certificado.create({
            data: {
                titulo,
                horas: Number(horas),
                alunoId: alunoIdNumerico,
                grupoId: grupoIdNumerico,
                arquivoUrl: req.file.path,
                status: 'PENDENTE'
            }
        });

        res.status(201).json(serializeCertificado(novoCertificado));
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Erro ao enviar certificado.' });
    }
});

app.get('/grupos-progresso/:alunoId', async (req, res) => {
    const alunoId = parseId(req.params.alunoId);

    if (!alunoId) {
        return res.status(400).json({ error: 'Aluno invalido.' });
    }

    try {
        const grupos = await prisma.grupo.findMany({
            orderBy: { numero: 'asc' },
            include: {
                certificados: {
                    where: {
                        alunoId,
                        status: 'APROVADO'
                    },
                    select: {
                        horas: true,
                        horasValidadas: true
                    }
                }
            }
        });

        const progresso = grupos.map((grupo) => {
            const horasAprovadas = grupo.certificados.reduce(
                (soma, cert) => soma + (cert.horasValidadas ?? cert.horas),
                0
            );

            return {
                id: grupo.id,
                numero: grupo.numero,
                descricao: grupo.descricao,
                horasMaximas: grupo.horasMaximas,
                horasAprovadas
            };
        });

        res.json(progresso);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao calcular progresso.' });
    }
});

app.get('/certificados-resumo/:alunoId', async (req, res) => {
    const alunoId = parseId(req.params.alunoId);

    if (!alunoId) {
        return res.status(400).json({ error: 'Aluno invalido.' });
    }

    try {
        const certificados = await prisma.certificado.findMany({
            where: { alunoId },
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
        res.status(500).json({ error: 'Erro ao carregar resumo dos certificados.' });
    }
});

app.get('/alunos/:alunoId/certificados', async (req, res) => {
    const alunoId = parseId(req.params.alunoId);

    if (!alunoId) {
        return res.status(400).json({ error: 'Aluno invalido.' });
    }

    try {
        const aluno = await prisma.usuario.findFirst({
            where: {
                id: alunoId,
                role: 'ALUNO'
            }
        });

        if (!aluno) {
            return res.status(404).json({ error: 'Aluno nao encontrado.' });
        }

        const certificados = await prisma.certificado.findMany({
            where: { alunoId },
            include: {
                grupo: {
                    select: {
                        id: true,
                        numero: true,
                        descricao: true
                    }
                },
                analisadoPor: {
                    select: {
                        id: true,
                        nome: true
                    }
                }
            }
        });

        const certificadosOrdenados = certificados
            .map((certificado) => serializeCertificado(certificado))
            .sort((a, b) => {
                const weightA = certificateStatusWeight[a.status] ?? 99;
                const weightB = certificateStatusWeight[b.status] ?? 99;

                if (weightA !== weightB) {
                    return weightA - weightB;
                }

                return new Date(b.dataEnvio).getTime() - new Date(a.dataEnvio).getTime();
            });

        res.json(certificadosOrdenados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao carregar certificados do aluno.' });
    }
});

app.get('/professor/dashboard/:professorId', async (req, res) => {
    const professorId = parseId(req.params.professorId);

    if (!professorId) {
        return res.status(400).json({ error: 'Professor invalido.' });
    }

    try {
        const professor = await buscarProfessor(professorId);

        if (!professor) {
            return res.status(404).json({ error: 'Professor nao encontrado.' });
        }

        const alunos = await prisma.usuario.findMany({
            where: {
                professorId,
                role: 'ALUNO'
            },
            select: { id: true }
        });

        const alunoIds = alunos.map((aluno) => aluno.id);

        const [certificadosPendentes, certificadosAprovados, certificadosRejeitados, certificadosAprovadosLista] = await Promise.all([
            prisma.certificado.count({
                where: {
                    alunoId: { in: alunoIds.length ? alunoIds : [-1] },
                    status: 'PENDENTE'
                }
            }),
            prisma.certificado.count({
                where: {
                    alunoId: { in: alunoIds.length ? alunoIds : [-1] },
                    status: 'APROVADO'
                }
            }),
            prisma.certificado.count({
                where: {
                    alunoId: { in: alunoIds.length ? alunoIds : [-1] },
                    status: 'REJEITADO'
                }
            }),
            prisma.certificado.findMany({
                where: {
                    alunoId: { in: alunoIds.length ? alunoIds : [-1] },
                    status: 'APROVADO'
                },
                select: {
                    horas: true,
                    horasValidadas: true
                }
            })
        ]);

        const horasValidadas = certificadosAprovadosLista.reduce(
            (soma, certificado) => soma + (certificado.horasValidadas ?? certificado.horas),
            0
        );

        res.json({
            totalAlunos: alunoIds.length,
            certificadosPendentes,
            certificadosAprovados,
            certificadosRejeitados,
            horasValidadas
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao carregar painel do professor.' });
    }
});

app.get('/professor/alunos/:professorId', async (req, res) => {
    const professorId = parseId(req.params.professorId);

    if (!professorId) {
        return res.status(400).json({ error: 'Professor invalido.' });
    }

    try {
        const professor = await buscarProfessor(professorId);

        if (!professor) {
            return res.status(404).json({ error: 'Professor nao encontrado.' });
        }

        const alunos = await prisma.usuario.findMany({
            where: {
                professorId,
                role: 'ALUNO'
            },
            orderBy: { nome: 'asc' },
            include: {
                certificadosEnviados: {
                    select: {
                        status: true,
                        horas: true,
                        horasValidadas: true
                    }
                }
            }
        });

        const alunosFormatados = alunos.map((aluno) => {
            const resumo = aluno.certificadosEnviados.reduce((acc, certificado) => {
                if (certificado.status === 'PENDENTE') acc.pendentes += 1;
                if (certificado.status === 'APROVADO') {
                    acc.aprovados += 1;
                    acc.horasValidadas += certificado.horasValidadas ?? certificado.horas;
                }
                if (certificado.status === 'REJEITADO') acc.rejeitados += 1;
                return acc;
            }, {
                pendentes: 0,
                aprovados: 0,
                rejeitados: 0,
                horasValidadas: 0
            });

            return {
                id: aluno.id,
                nome: aluno.nome,
                email: aluno.email,
                serie: aluno.serie,
                totalCertificados: aluno.certificadosEnviados.length,
                ...resumo
            };
        });

        res.json(alunosFormatados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao carregar alunos do professor.' });
    }
});

app.post('/professor/alunos', async (req, res) => {
    const { nome, email, senha, professorId, serie } = req.body;
    const professorIdNumerico = parseId(professorId);
    const normalizedEmail = normalizeEmail(email);

    if (!professorIdNumerico) {
        return res.status(400).json({ error: 'Professor invalido.' });
    }

    try {
        const professor = await buscarProfessor(professorIdNumerico);

        if (!professor) {
            return res.status(404).json({ error: 'Professor nao encontrado.' });
        }

        const usuarioExistente = await buscarUsuarioPorEmail(normalizedEmail);

        if (usuarioExistente) {
            return res.status(400).json({ error: 'Nao foi possivel cadastrar o aluno.' });
        }

        const aluno = await prisma.usuario.create({
            data: {
                nome,
                email: normalizedEmail,
                serie: normalizeSerie(serie),
                senha,
                role: 'ALUNO',
                professorId: professorIdNumerico
            }
        });

        res.status(201).json(aluno);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Nao foi possivel cadastrar o aluno.' });
    }
});

app.get('/professor/certificados/:professorId', async (req, res) => {
    const professorId = parseId(req.params.professorId);

    if (!professorId) {
        return res.status(400).json({ error: 'Professor invalido.' });
    }

    try {
        const professor = await buscarProfessor(professorId);

        if (!professor) {
            return res.status(404).json({ error: 'Professor nao encontrado.' });
        }

        const certificados = await prisma.certificado.findMany({
            where: {
                aluno: {
                    professorId
                }
            },
            include: {
                aluno: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                },
                grupo: {
                    select: {
                        id: true,
                        numero: true,
                        descricao: true
                    }
                },
                analisadoPor: {
                    select: {
                        id: true,
                        nome: true
                    }
                }
            }
        });

        const certificadosOrdenados = certificados
            .map((certificado) => serializeCertificado(certificado))
            .sort((a, b) => {
                const weightA = certificateStatusWeight[a.status] ?? 99;
                const weightB = certificateStatusWeight[b.status] ?? 99;

                if (weightA !== weightB) {
                    return weightA - weightB;
                }

                return new Date(b.dataEnvio).getTime() - new Date(a.dataEnvio).getTime();
            });

        res.json(certificadosOrdenados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao carregar certificados do professor.' });
    }
});

app.patch('/professor/certificados/:certificadoId', async (req, res) => {
    const certificadoId = parseId(req.params.certificadoId);
    const professorId = parseId(req.body.professorId);
    const grupoId = parseId(req.body.grupoId);
    const status = req.body.status;
    const observacaoProfessor = typeof req.body.observacaoProfessor === 'string'
        ? req.body.observacaoProfessor.trim()
        : null;

    if (!certificadoId || !professorId) {
        return res.status(400).json({ error: 'Dados invalidos para avaliar certificado.' });
    }

    if (!['APROVADO', 'REJEITADO'].includes(status)) {
        return res.status(400).json({ error: 'Status de avaliacao invalido.' });
    }

    try {
        const professor = await buscarProfessor(professorId);

        if (!professor) {
            return res.status(404).json({ error: 'Professor nao encontrado.' });
        }

        const certificado = await prisma.certificado.findFirst({
            where: {
                id: certificadoId,
                aluno: {
                    professorId
                }
            }
        });

        if (!certificado) {
            return res.status(404).json({ error: 'Certificado nao encontrado para este professor.' });
        }

        const grupoIdAvaliacao = grupoId || certificado.grupoId;
        let horasValidadas = null;

        if (status === 'APROVADO') {
            if (!grupoIdAvaliacao) {
                return res.status(400).json({ error: 'Selecione um grupo valido para aprovar o certificado.' });
            }

            horasValidadas = Number(req.body.horasValidadas);

            if (!Number.isFinite(horasValidadas) || horasValidadas <= 0) {
                return res.status(400).json({ error: 'Informe uma quantidade valida de horas.' });
            }

            if (horasValidadas > certificado.horas) {
                return res.status(400).json({ error: 'As horas validadas nao podem exceder as horas enviadas.' });
            }
        }

        const certificadoAtualizado = await prisma.certificado.update({
            where: { id: certificadoId },
            data: {
                status,
                grupoId: grupoIdAvaliacao,
                horasValidadas,
                observacaoProfessor: observacaoProfessor || null,
                dataAnalise: new Date(),
                analisadoPorId: professorId
            },
            include: {
                aluno: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                },
                grupo: {
                    select: {
                        id: true,
                        numero: true,
                        descricao: true
                    }
                },
                analisadoPor: {
                    select: {
                        id: true,
                        nome: true
                    }
                }
            }
        });

        res.json(serializeCertificado(certificadoAtualizado));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar certificado.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
