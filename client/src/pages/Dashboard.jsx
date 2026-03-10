import api from '../api/api';
import InstitutionalHeader from '../components/InstitutionalHeader';
import TransitionLoader from '../components/TransitionLoader';
import { useQuery } from '@tanstack/react-query';
import { Clock3, BadgeCheck, BadgeX } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-[var(--page-bg)] pb-12">
            <InstitutionalHeader
                hideHeading
                navItems={[
                    { label: 'Home', onClick: () => {} },
                    { label: 'Grupos de horas', onClick: () => {} },
                    { label: 'Perfil', onClick: () => {} },
                ]}
                actionItems={[
                    { label: 'Novo certificado', onClick: () => {} },
                    { label: 'Sair', onClick: () => {} },
                ]}
            />

            <main className="mx-auto max-w-7xl space-y-8 px-4 pt-8 md:px-6 lg:px-8">
                <section className="grid gap-5 lg:grid-cols-[1.25fr_0.8fr_0.7fr]">
                    <div className="rounded-[2rem] bg-[linear-gradient(135deg,#4a525d_0%,#2b3138_100%)] p-6 shadow-[0_28px_65px_rgba(34,40,48,0.16)]">
                        <div className="h-4 w-44 animate-pulse rounded-full bg-white/20" />
                        <div className="mt-5 h-10 w-4/5 animate-pulse rounded-2xl bg-white/18" />
                        <div className="mt-3 h-4 w-3/5 animate-pulse rounded-full bg-white/15" />
                    </div>

                    {[1, 2].map((item) => (
                        <div
                            key={item}
                            className="rounded-[1.7rem] border border-[var(--line)] bg-white p-4 shadow-[0_20px_40px_rgba(44,52,61,0.05)]"
                        >
                            <div className="mb-4 flex items-center gap-3">
                                <div className="h-10 w-10 animate-pulse rounded-2xl bg-[var(--brand-red-soft)]" />
                                <div className="h-3 w-28 animate-pulse rounded-full bg-[#e7eaee]" />
                            </div>
                            <div className="h-10 w-24 animate-pulse rounded-2xl bg-[#eef1f4]" />
                            <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-[#eef1f4]" />
                            <div className="mt-3 h-3 w-3/4 animate-pulse rounded-full bg-[#eef1f4]" />
                        </div>
                    ))}
                </section>

                <section className="grid items-center gap-5 lg:grid-cols-[1fr_0.8fr]">
                    <div className="flex justify-center py-4">
                        <div className="h-72 w-72 animate-pulse rounded-full bg-[#eef1f4]" />
                    </div>

                    <div className="space-y-4">
                        {[1, 2].map((item) => (
                            <div
                                key={item}
                                className="rounded-[1.5rem] border border-[var(--line)] bg-white px-5 py-4 shadow-[0_18px_35px_rgba(44,52,61,0.05)]"
                            >
                                <div className="mb-3 flex items-center gap-3">
                                    <div className="h-10 w-10 animate-pulse rounded-2xl bg-[var(--brand-red-soft)]" />
                                    <div className="h-3 w-24 animate-pulse rounded-full bg-[#e7eaee]" />
                                </div>
                                <div className="h-8 w-20 animate-pulse rounded-xl bg-[#eef1f4]" />
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

function OverviewCard({ currentHours, totalHours }) {
    const percent = totalHours > 0 ? Math.round((currentHours * 100) / totalHours) : 0;

    return (
        <div className="rounded-[1.7rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f8fa_100%)] p-4 shadow-[0_20px_40px_rgba(44,52,61,0.08)]">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-red-soft)] text-[var(--brand-red)]">
                        <Clock3 size={18} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                        Horas cadastradas
                    </span>
                </div>
                <span className="rounded-full bg-[#edf1f4] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                    {percent}%
                </span>
            </div>

            <strong className="block text-[2.5rem] font-bold leading-none text-[var(--ink)]">{currentHours}h</strong>
            <p className="mt-1 text-sm text-[var(--muted)]">de {totalHours}h concluidas</p>

            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[#e4e8ec]">
                <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#ce1126_0%,#f04b58_100%)]"
                    style={{ width: `${Math.max(percent, 6)}%` }}
                />
            </div>
        </div>
    );
}

function AnalysisCard({ value }) {
    return (
        <div className="rounded-[1.7rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f8fa_100%)] p-4 shadow-[0_20px_40px_rgba(44,52,61,0.08)]">
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff4e6] text-[#c97a16]">
                    <Clock3 size={18} />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                    Em analise
                </span>
            </div>
            <strong className="block text-[2.4rem] font-bold leading-none text-[var(--ink)]">{value}</strong>
            <p className="mt-3 text-sm leading-5 text-[var(--muted)]">Certificados aguardando avaliacao.</p>
        </div>
    );
}

function LargePieChart({ aprovados, reprovados }) {
    const total = aprovados + reprovados;
    const approvedPercent = total > 0 ? Math.round((aprovados * 100) / total) : 0;
    const pieStyle = {
        background: total > 0
            ? `conic-gradient(#2f8f57 0% ${approvedPercent}%, #ce1126 ${approvedPercent}% 100%)`
            : 'conic-gradient(#d9dde2 0% 100%)'
    };

    return (
        <div className="flex justify-center py-2 lg:justify-start lg:pl-25">
            <div className="relative h-[20rem] w-[20rem] rounded-full shadow-[0_28px_70px_rgba(44,52,61,0.12)]" style={pieStyle}>
                <div className="absolute inset-10 flex items-center justify-center rounded-full bg-[var(--page-bg)] text-center shadow-[inset_0_0_0_1px_rgba(220,224,229,0.8)]">
                    <div>
                        <strong className="block text-4xl font-bold text-[var(--ink)]">{total}</strong>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
                            certificados avaliados
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function WideMetricCard({ icon: Icon, label, value, helper, tone = 'green' }) {
    const tones = {
        green: 'bg-[#eaf7ef] text-[#2f8f57]',
        red: 'bg-[var(--brand-red-soft)] text-[var(--brand-red)]',
    };

    return (
        <div className="rounded-[1.5rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f8fa_100%)] px-5 py-4 shadow-[0_18px_35px_rgba(44,52,61,0.08)]">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tones[tone]}`}>
                        <Icon size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">{helper}</p>
                    </div>
                </div>
                <strong className="text-3xl font-bold leading-none text-[var(--ink)]">{value}</strong>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [isTransitioning, setIsTransitioning] = useState(false);

    const usuarioJson = localStorage.getItem('usuario');
    const usuario = usuarioJson ? JSON.parse(usuarioJson) : null;

    const { data: grupos, isLoading: loadingGrupos, error: errorGrupos } = useQuery({
        queryKey: ['grupos-progresso', usuario?.id],
        queryFn: async () => {
            const res = await api.get(`/grupos-progresso/${usuario.id}`);
            return res.data;
        },
        enabled: !!usuario?.id
    });

    const { data: resumo, isLoading: loadingResumo, error: errorResumo } = useQuery({
        queryKey: ['certificados-resumo', usuario?.id],
        queryFn: async () => {
            const res = await api.get(`/certificados-resumo/${usuario.id}`);
            return res.data;
        },
        enabled: !!usuario?.id
    });

    const handleLogout = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            localStorage.removeItem('usuario');
            navigate('/');
        }, 450);
    };

    if (!usuario) {
        Promise.resolve().then(() => navigate('/'));
        return null;
    }

    if (loadingGrupos || loadingResumo) return <TransitionLoader label="Carregando painel..." />;
    if (errorGrupos || errorResumo) return <div className="mt-20 text-center text-[var(--brand-red)]">Erro ao carregar dados.</div>;

    const currentHours = grupos?.reduce((sum, grupo) => sum + grupo.horasAprovadas, 0) || 0;
    const totalHours = grupos?.reduce((sum, grupo) => sum + grupo.horasMaximas, 0) || 0;

    return (
        <div className="min-h-screen bg-[var(--page-bg)] pb-12">
            {isTransitioning ? <TransitionLoader label="Saindo..." /> : null}
            <InstitutionalHeader
                title="Painel do aluno"
                subtitle={`Ola, ${usuario.nome}. Acompanhe o cumprimento das horas complementares.`}
                hideHeading
                navItems={[
                    { label: 'Home', onClick: () => navigate('/dashboard') },
                    { label: 'Grupos de horas', onClick: () => navigate('/grupos') },
                    { label: 'Perfil', onClick: () => navigate('/perfil') },
                ]}
                actionItems={[
                    { label: 'Novo certificado', onClick: () => navigate('/enviar') },
                    { label: 'Sair', onClick: handleLogout },
                ]}
            />

            <main className="mx-auto max-w-7xl space-y-8 px-4 pt-8 md:px-6 lg:px-8">
                <section className="grid gap-5 lg:grid-cols-[1.25fr_0.8fr_0.7fr]">
                    <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#4a525d_0%,#2b3138_100%)] p-6 text-white shadow-[0_28px_65px_rgba(34,40,48,0.24)]">
                        <p className="mb-2 text-base font-medium uppercase tracking-[0.18em] text-[#ffd7dc]">
                            Ola, {usuario.nome} <span className="text-[1.9rem] align-[-4px]">👋🏼</span>
                        </p>
                        <h2 className="max-w-xl text-[1.9rem] font-bold leading-tight">
                            Seus certificados em um unico painel.
                        </h2>
                        <p className="mt-3 max-w-lg text-sm leading-6 text-[#d4d9de]">
                            Veja suas horas concluidas e os certificados que aguardam avaliacao.
                        </p>
                    </div>

                    <OverviewCard currentHours={currentHours} totalHours={totalHours} />
                    <AnalysisCard value={resumo?.emAnalise || 0} />
                </section>

                <section className="grid items-center gap-6 lg:grid-cols-[1fr_0.82fr]">
                    <LargePieChart aprovados={resumo?.aprovados || 0} reprovados={resumo?.reprovados || 0} />

                    <div className="space-y-4">
                        <WideMetricCard
                            icon={BadgeCheck}
                            label="Aprovados"
                            value={resumo?.aprovados || 0}
                            helper="Certificados ja validados."
                            tone="green"
                        />
                        <WideMetricCard
                            icon={BadgeX}
                            label="Reprovados"
                            value={resumo?.reprovados || 0}
                            helper="Certificados recusados na analise."
                            tone="red"
                        />
                    </div>
                </section>
            </main>
        </div>
    );
}
