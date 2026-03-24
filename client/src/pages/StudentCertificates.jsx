import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    BadgeCheck,
    BadgeX,
    Clock3,
    FileCheck2,
    Search
} from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../api/api';
import AppFooter from '../components/AppFooter';
import InstitutionalHeader from '../components/InstitutionalHeader';
import TransitionLoader from '../components/TransitionLoader';
import { getHomeRoute, getStoredUser } from '../utils/session';

function getStatusLabel(status) {
    if (status === 'APROVADO') return 'Aprovado';
    if (status === 'REJEITADO') return 'Rejeitado';
    return 'Pendente';
}

function getStatusBadge(status) {
    if (status === 'APROVADO') return 'bg-[#eaf7ef] text-[#2f8f57]';
    if (status === 'REJEITADO') return 'bg-[var(--brand-red-soft)] text-[var(--brand-red)]';
    return 'bg-[#fff4e6] text-[#c97a16]';
}

function SummaryBadge({ label, value, tone = 'default' }) {
    const tones = {
        default: 'bg-white text-[var(--ink)]',
        amber: 'bg-[#fff9ef] text-[#7f4f0e]',
        green: 'bg-[#f3fbf6] text-[#1d6d3e]',
        red: 'bg-[#fff4f5] text-[var(--brand-red)]',
    };

    return (
        <div className={`rounded-[1.5rem] border border-[var(--line)] px-4 py-4 shadow-[0_14px_30px_rgba(44,52,61,0.05)] ${tones[tone]}`}>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
            <strong className="mt-2 block text-2xl font-bold">{value}</strong>
        </div>
    );
}

function CertificateCard({ certificado }) {
    const arquivoCompleto = `${api.defaults.baseURL}${certificado.arquivoUrl}`;
    const analisadoEm = certificado.dataAnalise
        ? new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(new Date(certificado.dataAnalise))
        : null;
    const enviadoEm = new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
    }).format(new Date(certificado.dataEnvio));

    return (
        <article className="rounded-[1.8rem] border border-[var(--line)] bg-white p-5 shadow-[0_18px_35px_rgba(44,52,61,0.06)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-[var(--ink)]">{certificado.titulo}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${getStatusBadge(certificado.status)}`}>
                            {getStatusLabel(certificado.status)}
                        </span>
                    </div>

                    <p className="mt-3 text-sm text-[var(--muted)]">
                        Grupo: {certificado.grupo.numero} - {certificado.grupo.descricao}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                        Enviado em {enviadoEm}
                    </p>
                    {analisadoEm ? (
                        <p className="mt-1 text-sm text-[var(--muted)]">
                            Avaliado em {analisadoEm}
                            {certificado.analisadoPor?.nome ? ` por ${certificado.analisadoPor.nome}` : ''}
                        </p>
                    ) : null}
                </div>

                <div className="flex flex-wrap gap-3">
                    <span className="rounded-full bg-[var(--panel-soft)] px-3 py-2 text-sm font-semibold text-[var(--ink)]">
                        Solicitado: {certificado.horas}h
                    </span>
                    {certificado.status === 'APROVADO' && certificado.horasValidadas != null ? (
                        <span className="rounded-full bg-[#eaf7ef] px-3 py-2 text-sm font-semibold text-[#2f8f57]">
                            Validadas: {certificado.horasValidadas}h
                        </span>
                    ) : null}
                    <a
                        href={arquivoCompleto}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-full border border-[var(--line-strong)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)]"
                    >
                        Abrir comprovante
                    </a>
                </div>
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

export default function StudentCertificates() {
    const navigate = useNavigate();
    const usuario = getStoredUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('TODOS');
    const [isTransitioning, setIsTransitioning] = useState(false);

    const { data: certificados, isLoading, error } = useQuery({
        queryKey: ['aluno-certificados', usuario?.id],
        queryFn: async () => {
            const response = await api.get(`/alunos/${usuario.id}/certificados`);
            return response.data;
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

    const certificadosFiltrados = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        return (certificados || []).filter((certificado) => {
            const matchesStatus = statusFilter === 'TODOS' || certificado.status === statusFilter;
            const matchesSearch = !term
                || certificado.titulo.toLowerCase().includes(term)
                || certificado.grupo.descricao.toLowerCase().includes(term)
                || `${certificado.grupo.numero}`.includes(term);

            return matchesStatus && matchesSearch;
        });
    }, [certificados, searchTerm, statusFilter]);

    const resumo = useMemo(() => {
        return (certificados || []).reduce((acc, certificado) => {
            acc.total += 1;
            if (certificado.status === 'PENDENTE') acc.pendentes += 1;
            if (certificado.status === 'APROVADO') acc.aprovados += 1;
            if (certificado.status === 'REJEITADO') acc.rejeitados += 1;
            return acc;
        }, {
            total: 0,
            pendentes: 0,
            aprovados: 0,
            rejeitados: 0
        });
    }, [certificados]);

    if (!usuario) {
        return <Navigate to="/" replace />;
    }

    if (usuario.role !== 'ALUNO') {
        return <Navigate to={getHomeRoute(usuario.role)} replace />;
    }

    if (isLoading) {
        return <TransitionLoader label="Carregando certificados..." />;
    }

    if (error) {
        return <div className="mt-20 text-center text-[var(--brand-red)]">Erro ao carregar certificados.</div>;
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
                <section className="rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,#4b545f_0%,#343b44_100%)] p-8 text-white shadow-[0_28px_60px_rgba(36,42,50,0.24)]">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffd7dc]">Meus certificados</p>
                            <h1 className="mt-2 text-3xl font-bold">Acesse seus comprovantes e acompanhe cada analise.</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d8dde3]">
                                Consulte o status atual, abra o arquivo enviado e veja observacoes registradas pelo professor.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate('/enviar')}
                            className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[#f4f6f8]"
                        >
                            Enviar novo certificado
                        </button>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-4">
                    <SummaryBadge label="Total" value={resumo.total} />
                    <SummaryBadge label="Pendentes" value={resumo.pendentes} tone="amber" />
                    <SummaryBadge label="Aprovados" value={resumo.aprovados} tone="green" />
                    <SummaryBadge label="Rejeitados" value={resumo.rejeitados} tone="red" />
                </section>

                <section className="rounded-[1.8rem] border border-[var(--line)] bg-white p-5 shadow-[0_18px_35px_rgba(44,52,61,0.06)]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-red)]">Historico</p>
                            <h2 className="mt-2 text-2xl font-bold text-[var(--ink)]">Certificados enviados</h2>
                        </div>

                        <div className="flex w-full flex-col gap-3 lg:max-w-2xl lg:flex-row">
                            <label className="flex flex-1 items-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--panel-soft)]">
                                <span className="flex h-12 w-12 items-center justify-center text-[var(--muted)]">
                                    <Search size={18} />
                                </span>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Buscar por titulo ou grupo"
                                    className="h-12 flex-1 bg-transparent pr-4 text-sm text-[var(--ink)] outline-none"
                                />
                            </label>

                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                className="h-12 rounded-full border border-[var(--line)] bg-[var(--panel-soft)] px-4 text-sm font-semibold text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand-red)]"
                            >
                                <option value="TODOS">Todos os status</option>
                                <option value="PENDENTE">Pendentes</option>
                                <option value="APROVADO">Aprovados</option>
                                <option value="REJEITADO">Rejeitados</option>
                            </select>
                        </div>
                    </div>

                    {certificadosFiltrados.length ? (
                        <div className="mt-5 grid gap-4">
                            {certificadosFiltrados.map((certificado) => (
                                <CertificateCard key={certificado.id} certificado={certificado} />
                            ))}
                        </div>
                    ) : (
                        <div className="mt-5 rounded-[1.6rem] border border-dashed border-[var(--line-strong)] bg-[var(--panel-soft)] p-8 text-center text-[var(--muted)]">
                            Nenhum certificado encontrado para o filtro atual.
                        </div>
                    )}
                </section>

                <section className="rounded-[1.8rem] border border-[var(--line)] bg-white p-6 shadow-[0_18px_35px_rgba(44,52,61,0.06)]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-red-soft)] text-[var(--brand-red)]">
                            <FileCheck2 size={19} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Leitura rapida</p>
                            <p className="text-sm text-[var(--muted)]">Acompanhe o andamento de cada envio sem sair da sua area.</p>
                        </div>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl bg-[var(--panel-soft)] p-4">
                            <Clock3 className="text-[#c97a16]" size={20} />
                            <p className="mt-3 text-base font-bold text-[var(--ink)]">Pendentes</p>
                            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Continuam em fila ate a avaliacao do professor.</p>
                        </div>
                        <div className="rounded-2xl bg-[var(--panel-soft)] p-4">
                            <BadgeCheck className="text-[#2f8f57]" size={20} />
                            <p className="mt-3 text-base font-bold text-[var(--ink)]">Aprovados</p>
                            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Mostram a carga horaria validada quando a analise e concluida.</p>
                        </div>
                        <div className="rounded-2xl bg-[var(--panel-soft)] p-4">
                            <BadgeX className="text-[var(--brand-red)]" size={20} />
                            <p className="mt-3 text-base font-bold text-[var(--ink)]">Rejeitados</p>
                            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Exibem observacoes do professor para orientar o proximo envio.</p>
                        </div>
                    </div>
                </section>
            </main>

            <AppFooter />
        </div>
    );
}
