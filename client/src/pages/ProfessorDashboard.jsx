import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, BadgeX, Clock3, FileCheck2, GraduationCap } from 'lucide-react';
import api from '../api/api';
import ProfessorLayout from '../components/ProfessorLayout';
import TransitionLoader from '../components/TransitionLoader';
import { getStoredUser } from '../utils/session';

function SummaryCard({ icon, label, value, helper, tone = 'red' }) {
    const Icon = icon;
    const tones = {
        red: 'bg-[var(--brand-red-soft)] text-[var(--brand-red)]',
        amber: 'bg-[#fff4e6] text-[#c97a16]',
        green: 'bg-[#eaf7ef] text-[#2f8f57]',
        dark: 'bg-[#eef1f4] text-[var(--ink)]',
    };

    return (
        <div className="flex min-h-[220px] flex-col rounded-[1.5rem] border border-[var(--line)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f8fa_100%)] p-5 shadow-[0_16px_30px_rgba(44,52,61,0.08)]">
            <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tones[tone]}`}>
                    <Icon size={18} />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
                    <p className="text-sm text-[var(--muted)]">{helper}</p>
                </div>
            </div>
            <strong className="mt-5 block text-[2.15rem] font-bold leading-none text-[var(--ink)]">{value}</strong>
        </div>
    );
}

function QuickActionCard({ title, description, actionLabel, onClick }) {
    return (
        <article className="rounded-[1.8rem] border border-[var(--line)] bg-white p-6 shadow-[0_18px_35px_rgba(44,52,61,0.06)]">
            <h2 className="text-2xl font-bold text-[var(--ink)]">{title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">{description}</p>
            <button
                type="button"
                onClick={onClick}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-[var(--line-strong)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)]"
            >
                {actionLabel} <ArrowRight size={16} />
            </button>
        </article>
    );
}

export default function ProfessorDashboard() {
    const navigate = useNavigate();
    const usuario = getStoredUser();

    const { data: dashboard, isLoading, error } = useQuery({
        queryKey: ['professor-dashboard', usuario?.id],
        queryFn: async () => {
            const response = await api.get(`/professor/dashboard/${usuario.id}`);
            return response.data;
        },
        enabled: !!usuario?.id && usuario?.role === 'PROFESSOR'
    });

    if (isLoading) {
        return <TransitionLoader label="Carregando painel do professor..." />;
    }

    if (error) {
        return <div className="mt-20 text-center text-[var(--brand-red)]">Erro ao carregar dados do professor.</div>;
    }

    return (
        <ProfessorLayout
            title="Painel do professor"
            subtitle={`Ola, ${usuario?.nome}. Acompanhe o andamento das analises e da turma vinculada.`}
            actionItems={[
                { label: 'Cadastrar aluno', onClick: () => navigate('/professor/alunos') },
            ]}
        >
            <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] lg:items-center">
                <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#4a525d_0%,#2b3138_100%)] p-7 text-white shadow-[0_28px_65px_rgba(34,40,48,0.24)]">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ffd7dc]">
                        Painel do professor
                    </p>
                    <h1 className="mt-4 text-3xl font-bold leading-tight">
                        Analise certificados, valide horas e acompanhe a turma em telas separadas.
                    </h1>
                    <p className="mt-4 max-w-xl text-sm leading-6 text-[#d4d9de]">
                        Este painel mostra apenas a visao geral. O cadastro de alunos e a analise de certificados
                        ficam em paginas dedicadas para manter o fluxo mais organizado.
                    </p>
                </div>

                <SummaryCard
                    icon={GraduationCap}
                    label="Alunos"
                    value={dashboard?.totalAlunos || 0}
                    helper="alunos vinculados"
                    tone="dark"
                />
                <SummaryCard
                    icon={Clock3}
                    label="Pendentes"
                    value={dashboard?.certificadosPendentes || 0}
                    helper="aguardando analise"
                    tone="amber"
                />
                <SummaryCard
                    icon={FileCheck2}
                    label="Horas validadas"
                    value={`${dashboard?.horasValidadas || 0}h`}
                    helper="carga aprovada"
                    tone="green"
                />
            </section>

            <section className="lg:hidden">
                <QuickActionCard
                    title="Gerenciar alunos"
                    description="Cadastre novos alunos, acompanhe o total de certificados enviados e veja o resumo individual de cada vinculo em uma tela dedicada."
                    actionLabel="Abrir tela de alunos"
                    onClick={() => navigate('/professor/alunos')}
                />
            </section>

            <section className="grid gap-5 lg:grid-cols-3">
                <SummaryCard
                    icon={BadgeCheck}
                    label="Aprovados"
                    value={dashboard?.certificadosAprovados || 0}
                    helper="certificados aceitos"
                    tone="green"
                />
                <SummaryCard
                    icon={BadgeX}
                    label="Rejeitados"
                    value={dashboard?.certificadosRejeitados || 0}
                    helper="certificados recusados"
                    tone="red"
                />
                <SummaryCard
                    icon={GraduationCap}
                    label="Base ativa"
                    value={dashboard?.totalAlunos || 0}
                    helper="alunos sob acompanhamento"
                    tone="dark"
                />
            </section>

            <section className="lg:hidden">
                <QuickActionCard
                    title="Avaliar certificados"
                    description="Analise comprovantes recebidos, ajuste o grupo da atividade e valide a carga horaria diretamente na tela de certificados."
                    actionLabel="Abrir tela de certificados"
                    onClick={() => navigate('/professor/certificados')}
                />
            </section>

            <section className="hidden gap-6 lg:grid lg:grid-cols-2">
                <QuickActionCard
                    title="Gerenciar alunos"
                    description="Cadastre novos alunos, acompanhe o total de certificados enviados e veja o resumo individual de cada vinculo em uma tela dedicada."
                    actionLabel="Abrir tela de alunos"
                    onClick={() => navigate('/professor/alunos')}
                />
                <QuickActionCard
                    title="Avaliar certificados"
                    description="Analise comprovantes recebidos, ajuste o grupo da atividade e valide a carga horaria diretamente na tela de certificados."
                    actionLabel="Abrir tela de certificados"
                    onClick={() => navigate('/professor/certificados')}
                />
            </section>

            <section className="rounded-[1.8rem] border border-[var(--line)] bg-white p-6 shadow-[0_18px_35px_rgba(44,52,61,0.06)]">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-red-soft)] text-[var(--brand-red)]">
                        <FileCheck2 size={19} />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Fluxo separado</p>
                        <p className="text-sm text-[var(--muted)]">cada responsabilidade em sua tela</p>
                    </div>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-[var(--panel-soft)] p-4">
                        <strong className="text-base font-bold text-[var(--ink)]">1. Painel</strong>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Visao geral dos numeros principais e atalhos operacionais.</p>
                    </div>
                    <div className="rounded-2xl bg-[var(--panel-soft)] p-4">
                        <strong className="text-base font-bold text-[var(--ink)]">2. Alunos</strong>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Cadastro e acompanhamento da base vinculada ao professor.</p>
                    </div>
                    <div className="rounded-2xl bg-[var(--panel-soft)] p-4">
                        <strong className="text-base font-bold text-[var(--ink)]">3. Certificados</strong>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Analise, observacoes, reenquadramento e validacao de horas.</p>
                    </div>
                </div>
            </section>
        </ProfessorLayout>
    );
}
