import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpDown, ChartColumn, IdCard, Search, UsersRound } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/api';
import ProfessorStudentPerformancePanel from '../components/ProfessorStudentPerformancePanel';
import ProfessorLayout from '../components/ProfessorLayout';
import TransitionLoader from '../components/TransitionLoader';
import { getStoredUser } from '../utils/session';

const SERIE_OPTIONS = ['1a Serie', '2a Serie', '3a Serie'];

function getProgressPercent(aluno, totalHorasDisponiveis) {
    if (!totalHorasDisponiveis) {
        return 0;
    }

    return Math.min(Math.round((aluno.horasValidadas * 100) / totalHorasDisponiveis), 100);
}

function StudentRow({ aluno, totalHorasDisponiveis, isActive, onOpen }) {
    const percentual = getProgressPercent(aluno, totalHorasDisponiveis);

    return (
        <button
            type="button"
            onClick={onOpen}
            className={`w-full rounded-[1.7rem] border p-5 text-left transition-all lg:p-6 ${
                isActive
                    ? 'border-[var(--brand-red)] bg-[var(--brand-red-soft)] shadow-[0_18px_34px_rgba(206,17,38,0.10)]'
                    : 'border-[var(--line)] bg-white shadow-[0_16px_30px_rgba(44,52,61,0.05)] hover:border-[var(--brand-red)]'
            }`}
        >
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-[var(--ink)]">{aluno.nome}</h3>
                        <span className="rounded-full bg-[var(--panel-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                            {aluno.serie || 'Sem serie'}
                        </span>
                    </div>
                    <p className="mt-2 flex items-center gap-2 text-sm text-[var(--muted)]">
                        <IdCard size={15} />
                        {aluno.rm ? `RM ${aluno.rm}` : 'RM nao informado'}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:min-w-[25rem] 2xl:min-w-[26.5rem]">
                    <div className="rounded-2xl bg-[var(--panel-soft)] px-4 py-3">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Horas</p>
                        <strong className="mt-1 block text-lg font-bold text-[var(--ink)]">{aluno.horasValidadas}h</strong>
                    </div>
                    <div className="rounded-2xl bg-[var(--panel-soft)] px-4 py-3">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Pendentes</p>
                        <strong className="mt-1 block text-lg font-bold text-[var(--ink)]">{aluno.pendentes}</strong>
                    </div>
                    <div className="rounded-2xl bg-[var(--panel-soft)] px-4 py-3">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Aprovados</p>
                        <strong className="mt-1 block text-lg font-bold text-[var(--ink)]">{aluno.aprovados}</strong>
                    </div>
                    <div className="rounded-2xl bg-[var(--panel-soft)] px-4 py-3">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Progresso</p>
                        <strong className="mt-1 block text-lg font-bold text-[var(--ink)]">{percentual}%</strong>
                    </div>
                </div>
            </div>

            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[#e4e8ec]">
                <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#ce1126_0%,#f04b58_100%)] transition-all duration-500"
                    style={{ width: `${Math.max(percentual, percentual > 0 ? 6 : 0)}%` }}
                />
            </div>
        </button>
    );
}

export default function ProfessorStudentsList() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
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

            return getProgressPercent(alunoB, totalHorasDisponiveis) - getProgressPercent(alunoA, totalHorasDisponiveis);
        });
    }, [alunos, searchTerm, serieFilter, sortBy, totalHorasDisponiveis]);

    const resumo = useMemo(() => ({
        totalAlunos: alunosFiltrados.length,
        totalHoras: alunosFiltrados.reduce((soma, aluno) => soma + aluno.horasValidadas, 0),
        totalPendentes: alunosFiltrados.reduce((soma, aluno) => soma + aluno.pendentes, 0),
        totalAprovados: alunosFiltrados.reduce((soma, aluno) => soma + aluno.aprovados, 0)
    }), [alunosFiltrados]);
    const selectedStudentParam = searchParams.get('aluno');

    useEffect(() => {
        if (!alunosFiltrados.length) {
            setSelectedStudentId(null);
            return;
        }

        if (selectedStudentParam) {
            const requestedStudent = alunosFiltrados.find((aluno) => String(aluno.id) === selectedStudentParam);

            if (requestedStudent) {
                if (requestedStudent.id !== selectedStudentId) {
                    setSelectedStudentId(requestedStudent.id);
                }

                const nextSearchParams = new URLSearchParams(searchParams);
                nextSearchParams.delete('aluno');
                setSearchParams(nextSearchParams, { replace: true });
                return;
            }

            const nextSearchParams = new URLSearchParams(searchParams);
            nextSearchParams.delete('aluno');
            setSearchParams(nextSearchParams, { replace: true });
        }

        const hasSelection = alunosFiltrados.some((aluno) => aluno.id === selectedStudentId);

        if (!hasSelection) {
            setSelectedStudentId(alunosFiltrados[0].id);
        }
    }, [alunosFiltrados, searchParams, selectedStudentId, selectedStudentParam, setSearchParams]);

    const handleOpenPerformance = (alunoId) => {
        setSelectedStudentId(alunoId);

        if (window.innerWidth < 1280) {
            mobilePanelRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
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
            contentClassName="mx-auto w-full max-w-[1540px] flex-1 space-y-8 px-4 pb-16 pt-8 md:px-6 xl:px-8 2xl:max-w-[1720px]"
            actionItems={[
                { label: 'Gerenciar alunos', onClick: () => navigate('/professor/alunos') },
            ]}
        >
            <section className="rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[0_18px_35px_rgba(44,52,61,0.06)] lg:p-6 xl:p-7">
                <div className="flex flex-col gap-6 2xl:grid 2xl:grid-cols-[minmax(0,1fr)_minmax(720px,0.95fr)] 2xl:items-center">
                    <div className="max-w-3xl">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]">Listagem da turma</p>
                        <h2 className="mt-2 text-2xl font-bold text-[var(--ink)]">Alunos com filtros e desempenho</h2>
                        <div className="mt-3 flex flex-wrap gap-2 text-sm text-[var(--muted)]">
                            <span className="rounded-full bg-[var(--panel-soft)] px-3 py-2">{resumo.totalAlunos} aluno(s)</span>
                            <span className="rounded-full bg-[var(--panel-soft)] px-3 py-2">{resumo.totalHoras}h validadas</span>
                            <span className="rounded-full bg-[var(--panel-soft)] px-3 py-2">{resumo.totalPendentes} pendencia(s)</span>
                            <span className="rounded-full bg-[var(--panel-soft)] px-3 py-2">{resumo.totalAprovados} aprovado(s)</span>
                            <span className="rounded-full bg-[var(--panel-soft)] px-3 py-2">meta {totalHorasDisponiveis}h</span>
                        </div>
                    </div>

                    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.55fr)_minmax(220px,0.72fr)_minmax(270px,0.9fr)] 2xl:w-full">
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
                                className="h-12 min-w-0 flex-1 bg-transparent outline-none"
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

            <div ref={mobilePanelRef} className="xl:hidden">
                {selectedStudentId ? (
                    <ProfessorStudentPerformancePanel
                        alunoId={selectedStudentId}
                        professorId={usuario.id}
                        onClose={() => setSelectedStudentId(null)}
                    />
                ) : null}
            </div>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,0.96fr)_minmax(520px,1.12fr)] xl:items-start 2xl:grid-cols-[minmax(0,0.92fr)_minmax(620px,1.2fr)]">
                <div className="space-y-4">
                    {alunosFiltrados.length ? (
                        alunosFiltrados.map((aluno) => (
                            <StudentRow
                                key={aluno.id}
                                aluno={aluno}
                                totalHorasDisponiveis={totalHorasDisponiveis}
                                isActive={selectedStudentId === aluno.id}
                                onOpen={() => handleOpenPerformance(aluno.id)}
                            />
                        ))
                    ) : (
                        <div className="rounded-[1.8rem] border border-dashed border-[var(--line-strong)] bg-[var(--panel-soft)] p-10 text-center text-[var(--muted)]">
                            Nenhum aluno encontrado para o filtro atual.
                        </div>
                    )}
                </div>

                <div className="hidden xl:block">
                    {selectedStudentId ? (
                        <div className="sticky top-8">
                            <ProfessorStudentPerformancePanel
                                alunoId={selectedStudentId}
                                professorId={usuario.id}
                                showCloseButton={false}
                            />
                        </div>
                    ) : (
                        <div className="rounded-[1.8rem] border border-[var(--line)] bg-white p-8 text-center text-[var(--muted)] shadow-[0_18px_35px_rgba(44,52,61,0.06)]">
                            Selecione um aluno para abrir o desempenho detalhado.
                        </div>
                    )}
                </div>
            </section>
        </ProfessorLayout>
    );
}
