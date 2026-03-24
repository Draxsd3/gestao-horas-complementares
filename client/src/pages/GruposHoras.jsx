import api from '../api/api';
import AppFooter from '../components/AppFooter';
import ProgressBar from '../components/ProgressBar';
import InstitutionalHeader from '../components/InstitutionalHeader';
import TransitionLoader from '../components/TransitionLoader';
import { useQuery } from '@tanstack/react-query';
import { BadgeCheck, Code2, FileCheck2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getHomeRoute, getStoredUser } from '../utils/session';

function ApprovedCertificateCard({ certificado }) {
    const arquivoCompleto = `${api.defaults.baseURL}${certificado.arquivoUrl}`;
    const dataAnalise = certificado.dataAnalise
        ? new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(new Date(certificado.dataAnalise))
        : null;

    return (
        <article className="rounded-[1.6rem] border border-[var(--line)] bg-white p-5 shadow-[0_18px_35px_rgba(44,52,61,0.06)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-[var(--ink)]">{certificado.titulo}</h3>
                        <span className="rounded-full bg-[#eaf7ef] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#2f8f57]">
                            Aprovado
                        </span>
                    </div>
                    <p className="mt-3 text-sm text-[var(--muted)]">Solicitado: {certificado.horas}h</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                        Validadas: {certificado.horasValidadas ?? certificado.horas}h
                    </p>
                    {dataAnalise ? (
                        <p className="mt-1 text-sm text-[var(--muted)]">
                            Avaliado em {dataAnalise}
                            {certificado.analisadoPor?.nome ? ` por ${certificado.analisadoPor.nome}` : ''}
                        </p>
                    ) : null}
                </div>

                <a
                    href={arquivoCompleto}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-[var(--line-strong)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)]"
                >
                    Abrir comprovante
                </a>
            </div>

            {certificado.observacaoProfessor ? (
                <div className="mt-5 border-t border-[var(--line)] pt-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Observacao do professor</p>
                    <p className="mt-2 rounded-2xl bg-[var(--panel-soft)] px-4 py-3 text-sm text-[var(--ink)]">
                        {certificado.observacaoProfessor}
                    </p>
                </div>
            ) : null}
        </article>
    );
}

export default function GruposHoras() {
    const navigate = useNavigate();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const usuario = getStoredUser();

    const { data: grupos, isLoading: loadingGrupos, error: errorGrupos } = useQuery({
        queryKey: ['grupos-progresso', usuario?.id],
        queryFn: async () => {
            const res = await api.get(`/grupos-progresso/${usuario.id}`);
            return res.data;
        },
        enabled: !!usuario?.id && usuario?.role === 'ALUNO'
    });

    const { data: certificados, isLoading: loadingCertificados, error: errorCertificados } = useQuery({
        queryKey: ['aluno-certificados', usuario?.id],
        queryFn: async () => {
            const res = await api.get(`/alunos/${usuario.id}/certificados`);
            return res.data;
        },
        enabled: !!usuario?.id && usuario?.role === 'ALUNO'
    });

    const handleLogout = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            localStorage.removeItem('usuario');
            navigate('/');
        }, 450);
    };

    if (!usuario) {
        return <Navigate to="/" replace />;
    }

    if (usuario.role !== 'ALUNO') {
        return <Navigate to={getHomeRoute(usuario.role)} replace />;
    }

    const certificadosAprovados = useMemo(() => {
        return (certificados || []).filter((certificado) => certificado.status === 'APROVADO');
    }, [certificados]);

    const aprovadosPorGrupo = useMemo(() => {
        return certificadosAprovados.reduce((acc, certificado) => {
            const groupId = certificado.grupo?.id || certificado.grupoId;

            if (!groupId) {
                return acc;
            }

            if (!acc[groupId]) {
                acc[groupId] = [];
            }

            acc[groupId].push(certificado);
            return acc;
        }, {});
    }, [certificadosAprovados]);

    const grupoSelecionado = useMemo(() => {
        return (grupos || []).find((grupo) => grupo.id === selectedGroupId) || null;
    }, [grupos, selectedGroupId]);

    const certificadosDoGrupoSelecionado = grupoSelecionado
        ? (aprovadosPorGrupo[grupoSelecionado.id] || [])
        : [];

    if (loadingGrupos || loadingCertificados) {
        return <TransitionLoader label="Carregando grupos..." />;
    }

    if (errorGrupos || errorCertificados) {
        return <div className="mt-20 text-center text-[var(--brand-red)]">Erro ao carregar grupos.</div>;
    }

    return (
        <div className="flex min-h-screen flex-col bg-[var(--page-bg)]">
            {isTransitioning ? <TransitionLoader label="Saindo..." /> : null}
            <InstitutionalHeader
                hideHeading
                navItems={[
                    { label: 'Home', onClick: () => navigate('/dashboard') },
                    { label: 'Certificados', onClick: () => navigate('/certificados') },
                    { label: 'Grupos de horas', onClick: () => navigate('/grupos') },
                    { label: 'Perfil', onClick: () => navigate('/perfil') },
                ]}
                actionItems={[
                    { label: 'Novo certificado', onClick: () => navigate('/enviar') },
                    { label: 'Sair', onClick: handleLogout },
                ]}
            />

            <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 px-4 pb-16 pt-8 md:px-6 lg:px-8">
                <section>
                    <div className="mb-8">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-red)]">
                            Grupos de horas
                        </p>
                        <h1 className="mt-2 text-2xl font-bold text-[var(--ink)]">
                            Grupos de horas complementares
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
                            Acompanhe o progresso de cada categoria validada para o seu curso.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6">
                        {grupos?.map((grupo) => (
                            <ProgressBar
                                key={grupo.id}
                                tema={grupo.descricao}
                                atual={grupo.horasAprovadas}
                                maximo={grupo.horasMaximas}
                                Icon={Code2}
                                numero={grupo.numero}
                                certificadosAprovados={(aprovadosPorGrupo[grupo.id] || []).length}
                                isActive={selectedGroupId === grupo.id}
                                onClick={() => setSelectedGroupId((currentId) => currentId === grupo.id ? null : grupo.id)}
                            />
                        ))}
                    </div>
                </section>

                {grupoSelecionado ? (
                    <section className="rounded-[1.8rem] border border-[var(--line)] bg-white p-6 shadow-[0_18px_35px_rgba(44,52,61,0.06)]">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]">
                                    Grupo {grupoSelecionado.numero}
                                </p>
                                <h2 className="mt-2 text-2xl font-bold text-[var(--ink)]">
                                    Certificados aprovados deste grupo
                                </h2>
                                <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                                    {grupoSelecionado.descricao}
                                </p>
                            </div>

                            <div className="inline-flex items-center gap-3 rounded-2xl bg-[var(--panel-soft)] px-4 py-3">
                                <BadgeCheck className="text-[#2f8f57]" size={18} />
                                <span className="text-sm font-semibold text-[var(--ink)]">
                                    {certificadosDoGrupoSelecionado.length} aprovado(s)
                                </span>
                            </div>
                        </div>

                        {certificadosDoGrupoSelecionado.length ? (
                            <div className="mt-6 grid gap-4">
                                {certificadosDoGrupoSelecionado.map((certificado) => (
                                    <ApprovedCertificateCard key={certificado.id} certificado={certificado} />
                                ))}
                            </div>
                        ) : (
                            <div className="mt-6 rounded-[1.6rem] border border-dashed border-[var(--line-strong)] bg-[var(--panel-soft)] p-8 text-center text-[var(--muted)]">
                                Nenhum certificado aprovado foi encontrado para este grupo ate o momento.
                            </div>
                        )}
                    </section>
                ) : (
                    <section className="rounded-[1.8rem] border border-[var(--line)] bg-white p-6 shadow-[0_18px_35px_rgba(44,52,61,0.06)]">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-red-soft)] text-[var(--brand-red)]">
                                <FileCheck2 size={19} />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Detalhamento por grupo</p>
                                <p className="text-sm text-[var(--muted)]">Clique em um card acima para listar os comprovantes aprovados daquela categoria.</p>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <AppFooter />
        </div>
    );
}
