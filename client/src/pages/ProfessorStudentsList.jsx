import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpDown, ChartColumn, GraduationCap, IdCard, Search, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import ProfessorStudentPerformancePanel from '../components/ProfessorStudentPerformancePanel';
import ProfessorLayout from '../components/ProfessorLayout';
import TransitionLoader from '../components/TransitionLoader';
import { getStoredUser } from '../utils/session';

const SERIE_OPTIONS = ['1a Serie', '2a Serie', '3a Serie'];

function SummaryCard({ label, value, helper }) {
    return (
        <div className="rounded-[1.6rem] border border-[var(--line)] bg-white px-5 py-5 shadow-[0_16px_32px_rgba(44,52,61,0.06)]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
            <strong className="mt-3 block text-3xl font-bold text-[var(--ink)]">{value}</strong>
            <p className="mt-2 text-sm text-[var(--muted)]">{helper}</p>
        </div>
    );
}

function StudentListCard({ aluno, totalHorasDisponiveis, isActive, onOpen }) {
    const percentual = totalHorasDisponiveis
        ? Math.min(Math.round((aluno.horasValidadas * 100) / totalHorasDisponiveis), 100)
        : 0;

    return (
        <button
            type="button"
            onClick={onOpen}
            className={`w-full rounded-[1.8rem] border p-5 text-left shadow-[0_18px_35px_rgba(44,52,61,0.06)] transition-all ${
                isActive
                    ? 'border-[var(--brand-red)] bg-[linear-gradient(180deg,#fff7f8_0%,#ffffff_100%)]'
                    : 'border-[var(--line)] bg-white hover:border-[var(--brand-red)] hover:-translate-y-0.5'
            }`}
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-[var(--ink)]">{aluno.nome}</h3>
                        {aluno.serie ? (
                            <span className="rounded-full bg-[var(--panel-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                                {aluno.serie}
                            </span>
                        ) : null}
                    </div>
                    <p className="mt-2 flex items-center gap-2 text-sm text-[var(--muted)]">
                        <IdCard size={15} />
                        {aluno.rm ? `RM ${aluno.rm}` : 'RM nao informado'}
                    </p>
                </div>

                <div className="rounded-2xl bg-[var(--panel-soft)] px-4 py-3 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Progresso</p>
                    <strong className="mt-1 block text-2xl font-bold text-[var(--ink)]">{percentual}%</strong>
                </div>
            </div>

            <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-[#e4e8ec]">
                <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#ce1126_0%,#f04b58_100%)] transition-all duration-500"
                    style={{ width: `${Math.max(percentual, percentual > 0 ? 8 : 0)}%` }}
                />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-[var(--panel-soft)] px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Horas</p>
                    <strong className="mt-1 block text-lg font-bold text-[var(--ink)]">{aluno.horasValidadas}h</strong>
                </div>
                <div className="rounded-2xl bg-[var(--panel-soft)] px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Aprovados</p>
                    <strong className="mt-1 block text-lg font-bold text-[var(--ink)]">{aluno.aprovados}</strong>
                </div>
                <div className="rounded-2xl bg-[var(--panel-soft)] px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Pendentes</p>
                    <strong className="mt-1 block text-lg font-bold text-[var(--ink)]">{aluno.pendentes}</strong>
                </div>
                <div className="rounded-2xl bg-[var(--panel-soft)] px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Registros</p>
                    <strong className="mt-1 block text-lg font-bold text-[var(--ink)]">{aluno.totalCertificados}</strong>
                </div>
            </div>
        </button>
    );
}

export default function ProfessorStudentsList() {
    const navigate = useNavigate();
    const usuario = getStoredUser();
    const mobilePanelRef = useRef(null);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [serieFilter, setSerieFilter] = useState('TODAS');
    const [sortBy, setSortBy] = useState('progresso');

    const { data: alunos, isLoading: loadingAlunos, error: errorAlunos } = useQuery({
        queryKey: ['professor-alunos', usuario?.id],
        queryFn: async () => {
            const response = await api.get(`/professor/alunos/${usuario.id}`);
            return response.data;
        },
        enabled: !!usuario?.id && usuario?.role === 'PROFESSOR'
    });

    const { data: grupos, isLoading: loadingGrupos, error: errorGrupos } = useQuery({
        queryKey: ['grupos'],
        queryFn: async () => {
            const response = await api.get('/grupos');
            return response.data;
        },
        enabled: !!usuario?.id && usuario?.role === 'PROFESSOR'
    });

    const totalHorasDisponiveis = useMemo(
        () => (grupos || []).reduce((soma, grupo) => soma + grupo.horasMaximas, 0),
        [grupos]
    );

    const alunosFiltrados = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        const filtered = (alunos || []).filter((aluno) => {
            const matchesSerie = serieFilter === 'TODAS' || aluno.serie === serieFilter;
            const matchesSearch = !term
                || aluno.nome.toLowerCase().includes(term)
                || (aluno.rm || '').toLowerCase().includes(term)
                || (aluno.serie || '').toLowerCase().includes(term);

            return matchesSerie && matchesSearch;
        });

        const getProgress = (aluno) => (
            totalHorasDisponiveis
                ? Math.min(Math.round((aluno.horasValidadas * 100) / totalHorasDisponiveis), 100)
                : 0
        );

        return filtered.sort((alunoA, alunoB) => {
            if (sortBy === 'nome') {
                return alunoA.nome.localeCompare(alunoB.nome);
            }

            if (sortBy === 'horas') {
                return alunoB.horasValidadas - alunoA.horasValidadas;
            }

            if (sortBy === 'pendentes') {
                return alunoB.pendentes - alunoA.pendentes;
            }

            return getProgress(alunoB) - getProgress(alunoA);
        });
    }, [alunos, searchTerm, serieFilter, sortBy, totalHorasDisponiveis]);

    useEffect(() => {
        if (!alunosFiltrados.length) {
            setSelectedStudentId(null);
            return;
        }

        const hasSelectedStudent = alunosFiltrados.some((aluno) => aluno.id === selectedStudentId);

        if (!hasSelectedStudent) {
            setSelectedStudentId(alunosFiltrados[0].id);
        }
    }, [alunosFiltrados, selectedStudentId]);

    const summary = useMemo(() => {
        const totalAlunos = alunosFiltrados.length;
        const totalHoras = alunosFiltrados.reduce((soma, aluno) => soma + aluno.horasValidadas, 0);
        const totalPendentes = alunosFiltrados.reduce((soma, aluno) => soma + aluno.pendentes, 0);
        const totalAprovados = alunosFiltrados.reduce((soma, aluno) => soma + aluno.aprovados, 0);

        return {
            totalAlunos,
            totalHoras,
            totalPendentes,
            totalAprovados,
            mediaHoras: totalAlunos ? Math.round(totalHoras / totalAlunos) : 0
        };
    }, [alunosFiltrados]);

    const handleOpenPerformance = (alunoId) => {
        setSelectedStudentId(alunoId);
        mobilePanelRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    if (loadingAlunos || loadingGrupos) {
        return <TransitionLoader label="Carregando listagem de alunos..." />;
    }

    if (errorAlunos || errorGrupos) {
        return <div className="mt-20 text-center text-[var(--brand-red)]">Erro ao carregar a listagem da turma.</div>;
    }

    return (
        <ProfessorLayout
            title="Listagem da turma"
            subtitle="Visualize a turma com mais clareza e abra o desempenho individual de cada aluno."
            actionItems={[
                { label: 'Gerenciar alunos', onClick: () => navigate('/professor/alunos') },
            ]}
        >
            <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr_0.8fr]">
                <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(140deg,#4a525d_0%,#2b3138_100%)] p-7 text-white shadow-[0_28px_65px_rgba(34,40,48,0.24)]">
                    <div className="flex items-center gap-3 text-[#ffd7dc]">
                        <UsersRound size={20} />
                        <p className="text-sm font-semibold uppercase tracking-[0.22em]">Visao da turma</p>
                    </div>
                    <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight">
                        Uma tela pensada para enxergar quem esta avancando e quem ainda precisa de atencao.
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-[#d4d9de]">
                        A listagem concentra busca, ordenacao e leitura rapida do progresso, enquanto o painel lateral mostra
                        em detalhes os grupos concluidos, pendencias e certificados de cada aluno.
                    </p>
                </div>

                <SummaryCard
                    label="Alunos visiveis"
                    value={summary.totalAlunos}
                    helper="alunos dentro do filtro atual"
                />
                <SummaryCard
                    label="Media aprovada"
                    value={`${summary.mediaHoras}h`}
                    helper="media de horas aprovadas por aluno"
                />
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    label="Horas validadas"
                    value={`${summary.totalHoras}h`}
                    helper="carga aprovada na turma filtrada"
                />
                <SummaryCard
                    label="Pendencias"
                    value={summary.totalPendentes}
                    helper="certificados aguardando analise"
                />
                <SummaryCard
                    label="Aprovados"
                    value={summary.totalAprovados}
                    helper="certificados validados pelo professor"
                />
                <SummaryCard
                    label="Carga alvo"
                    value={`${totalHorasDisponiveis}h`}
                    helper="meta configurada em todos os grupos"
                />
            </section>

            <div ref={mobilePanelRef} className="lg:hidden">
                {selectedStudentId ? (
                    <ProfessorStudentPerformancePanel
                        alunoId={selectedStudentId}
                        professorId={usuario.id}
                        onClose={() => setSelectedStudentId(null)}
                    />
                ) : null}
            </div>

            <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] xl:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-5">
                    <section className="rounded-[1.8rem] border border-[var(--line)] bg-white p-5 shadow-[0_18px_35px_rgba(44,52,61,0.06)]">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]">Leitura da turma</p>
                                <h2 className="mt-2 text-2xl font-bold text-[var(--ink)]">Listagem com filtros e prioridade</h2>
                            </div>

                            <div className="flex flex-col gap-3 xl:max-w-3xl xl:flex-row">
                                <label className="flex flex-1 items-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--panel-soft)]">
                                    <span className="flex h-12 w-12 items-center justify-center text-[var(--muted)]">
                                        <Search size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        placeholder="Buscar por nome, RM ou serie"
                                        className="h-12 flex-1 bg-transparent pr-4 text-sm text-[var(--ink)] outline-none"
                                    />
                                </label>

                                <select
                                    value={serieFilter}
                                    onChange={(event) => setSerieFilter(event.target.value)}
                                    className="h-12 rounded-full border border-[var(--line)] bg-[var(--panel-soft)] px-4 text-sm font-semibold text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand-red)]"
                                >
                                    <option value="TODAS">Todas as series</option>
                                    {SERIE_OPTIONS.map((serie) => (
                                        <option key={serie} value={serie}>{serie}</option>
                                    ))}
                                </select>

                                <label className="flex items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--panel-soft)] px-4 text-sm font-semibold text-[var(--ink)]">
                                    <ArrowUpDown size={16} className="text-[var(--muted)]" />
                                    <select
                                        value={sortBy}
                                        onChange={(event) => setSortBy(event.target.value)}
                                        className="h-12 bg-transparent outline-none"
                                    >
                                        <option value="progresso">Ordenar por progresso</option>
                                        <option value="horas">Ordenar por horas</option>
                                        <option value="pendentes">Ordenar por pendencias</option>
                                        <option value="nome">Ordenar por nome</option>
                                    </select>
                                </label>
                            </div>
                        </div>
                    </section>

                    {alunosFiltrados.length ? (
                        <div className="space-y-4">
                            {alunosFiltrados.map((aluno) => (
                                <StudentListCard
                                    key={aluno.id}
                                    aluno={aluno}
                                    totalHorasDisponiveis={totalHorasDisponiveis}
                                    isActive={selectedStudentId === aluno.id}
                                    onOpen={() => handleOpenPerformance(aluno.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[1.8rem] border border-dashed border-[var(--line-strong)] bg-[var(--panel-soft)] p-10 text-center text-[var(--muted)]">
                            Nenhum aluno encontrado para o filtro atual.
                        </div>
                    )}
                </div>

                <div className="hidden lg:block">
                    <div className="sticky top-8">
                        {selectedStudentId ? (
                            <ProfessorStudentPerformancePanel
                                alunoId={selectedStudentId}
                                professorId={usuario.id}
                                showCloseButton={false}
                            />
                        ) : (
                            <div className="rounded-[1.8rem] border border-[var(--line)] bg-white p-8 text-center text-[var(--muted)] shadow-[0_18px_35px_rgba(44,52,61,0.06)]">
                                Selecione um aluno para abrir o desempenho detalhado.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-[1.8rem] border border-[var(--line)] bg-white p-5 shadow-[0_18px_35px_rgba(44,52,61,0.06)]">
                    <UsersRound className="text-[var(--brand-red)]" size={22} />
                    <h3 className="mt-4 text-lg font-bold text-[var(--ink)]">Comparacao mais rapida</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        A turma fica em uma listagem continua, o que ajuda a bater o olho em horas, pendencias e volume de certificados.
                    </p>
                </div>
                <div className="rounded-[1.8rem] border border-[var(--line)] bg-white p-5 shadow-[0_18px_35px_rgba(44,52,61,0.06)]">
                    <ChartColumn className="text-[var(--brand-red)]" size={22} />
                    <h3 className="mt-4 text-lg font-bold text-[var(--ink)]">Desempenho ao lado</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        No desktop, o desempenho detalhado permanece visivel ao lado da lista, facilitando a consulta sem perder contexto.
                    </p>
                </div>
                <div className="rounded-[1.8rem] border border-[var(--line)] bg-white p-5 shadow-[0_18px_35px_rgba(44,52,61,0.06)]">
                    <GraduationCap className="text-[var(--brand-red)]" size={22} />
                    <h3 className="mt-4 text-lg font-bold text-[var(--ink)]">Foco em acompanhamento</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        A tela de listagem fica voltada para acompanhamento da turma, enquanto a tela de alunos continua cuidando do cadastro e importacao.
                    </p>
                </div>
            </section>
        </ProfessorLayout>
    );
}
