import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GraduationCap, Mail, Search, UserPlus2, UsersRound } from 'lucide-react';
import api from '../api/api';
import ProfessorLayout from '../components/ProfessorLayout';
import TransitionLoader from '../components/TransitionLoader';
import { getStoredUser } from '../utils/session';

const ROWS_PER_PAGE = 8;

function SummaryBadge({ label, value }) {
    return (
        <div className="rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-4 shadow-[0_14px_30px_rgba(44,52,61,0.05)]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
            <strong className="mt-2 block text-2xl font-bold text-[var(--ink)]">{value}</strong>
        </div>
    );
}

function MobileStudentRow({ aluno }) {
    return (
        <article className="rounded-[1.5rem] border border-[var(--line)] bg-white p-4 shadow-[0_14px_28px_rgba(44,52,61,0.05)]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-base font-bold text-[var(--ink)]">{aluno.nome}</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">{aluno.email}</p>
                </div>
                <span className="rounded-full bg-[var(--panel-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                    {aluno.totalCertificados} cert.
                </span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                <div className="rounded-2xl bg-[var(--panel-soft)] px-2 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Pend.</p>
                    <strong className="mt-1 block text-lg font-bold text-[var(--ink)]">{aluno.pendentes}</strong>
                </div>
                <div className="rounded-2xl bg-[var(--panel-soft)] px-2 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Apr.</p>
                    <strong className="mt-1 block text-lg font-bold text-[var(--ink)]">{aluno.aprovados}</strong>
                </div>
                <div className="rounded-2xl bg-[var(--panel-soft)] px-2 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Rej.</p>
                    <strong className="mt-1 block text-lg font-bold text-[var(--ink)]">{aluno.rejeitados}</strong>
                </div>
                <div className="rounded-2xl bg-[var(--panel-soft)] px-2 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Horas</p>
                    <strong className="mt-1 block text-lg font-bold text-[var(--ink)]">{aluno.horasValidadas}h</strong>
                </div>
            </div>
        </article>
    );
}

export default function ProfessorStudents() {
    const queryClient = useQueryClient();
    const usuario = getStoredUser();
    const [novoAluno, setNovoAluno] = useState({
        nome: '',
        email: '',
        senha: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const { data: alunos, isLoading, error } = useQuery({
        queryKey: ['professor-alunos', usuario?.id],
        queryFn: async () => {
            const response = await api.get(`/professor/alunos/${usuario.id}`);
            return response.data;
        },
        enabled: !!usuario?.id && usuario?.role === 'PROFESSOR'
    });

    const cadastrarAlunoMutation = useMutation({
        mutationFn: (payload) => api.post('/professor/alunos', payload),
        onSuccess: () => {
            setNovoAluno({ nome: '', email: '', senha: '' });
            queryClient.invalidateQueries({ queryKey: ['professor-dashboard', usuario.id] });
            queryClient.invalidateQueries({ queryKey: ['professor-alunos', usuario.id] });
            alert('Aluno cadastrado e vinculado ao professor.');
        },
        onError: (errorResponse) => {
            alert(errorResponse.response?.data?.error || 'Erro ao cadastrar aluno.');
        }
    });

    const handleCadastrarAluno = (event) => {
        event.preventDefault();
        cadastrarAlunoMutation.mutate({
            ...novoAluno,
            professorId: usuario.id
        });
    };

    const alunosFiltrados = (alunos || []).filter((aluno) => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        return aluno.nome.toLowerCase().includes(term) || aluno.email.toLowerCase().includes(term);
    });

    const totalPages = Math.max(1, Math.ceil(alunosFiltrados.length / ROWS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * ROWS_PER_PAGE;
    const alunosPaginados = alunosFiltrados.slice(startIndex, startIndex + ROWS_PER_PAGE);

    const totalPendentes = alunosFiltrados.reduce((sum, aluno) => sum + aluno.pendentes, 0);
    const totalHoras = alunosFiltrados.reduce((sum, aluno) => sum + aluno.horasValidadas, 0);

    if (isLoading) {
        return <TransitionLoader label="Carregando alunos..." />;
    }

    if (error) {
        return <div className="mt-20 text-center text-[var(--brand-red)]">Erro ao carregar alunos.</div>;
    }

    return (
        <ProfessorLayout
            title="Alunos vinculados"
            subtitle="Cadastre e acompanhe os alunos vinculados ao professor."
            actionItems={[
                { label: 'Cadastrar aluno', onClick: () => document.getElementById('cadastro-aluno')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) },
            ]}
        >
            <section className="grid gap-4 md:grid-cols-3">
                <SummaryBadge label="Alunos exibidos" value={alunosFiltrados.length} />
                <SummaryBadge label="Pendencias" value={totalPendentes} />
                <SummaryBadge label="Horas validadas" value={`${totalHoras}h`} />
            </section>

            <section className="rounded-[1.8rem] border border-[var(--line)] bg-white p-5 shadow-[0_18px_35px_rgba(44,52,61,0.06)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-red)]">Base de alunos</p>
                        <h2 className="mt-2 text-2xl font-bold text-[var(--ink)]">Lista compacta e pesquisavel</h2>
                    </div>

                    <label className="flex w-full items-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--panel-soft)] lg:max-w-md">
                        <span className="flex h-12 w-12 items-center justify-center text-[var(--muted)]">
                            <Search size={18} />
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => {
                                setSearchTerm(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Buscar por nome ou e-mail"
                            className="h-12 flex-1 bg-transparent pr-4 text-sm text-[var(--ink)] outline-none"
                        />
                    </label>
                </div>

                {alunosFiltrados.length ? (
                    <>
                        <div className="mt-5 hidden overflow-hidden rounded-[1.6rem] border border-[var(--line)] lg:block">
                            <table className="min-w-full border-collapse">
                                <thead className="bg-[var(--panel-soft)] text-left">
                                    <tr>
                                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Aluno</th>
                                        <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Pendentes</th>
                                        <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Aprovados</th>
                                        <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Rejeitados</th>
                                        <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Horas</th>
                                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Certificados</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alunosPaginados.map((aluno, index) => (
                                        <tr key={aluno.id} className={index !== alunosPaginados.length - 1 ? 'border-b border-[var(--line)]' : ''}>
                                            <td className="px-5 py-4">
                                                <strong className="block text-sm font-bold text-[var(--ink)]">{aluno.nome}</strong>
                                                <span className="mt-1 block text-sm text-[var(--muted)]">{aluno.email}</span>
                                            </td>
                                            <td className="px-4 py-4 text-sm font-semibold text-[var(--ink)]">{aluno.pendentes}</td>
                                            <td className="px-4 py-4 text-sm font-semibold text-[var(--ink)]">{aluno.aprovados}</td>
                                            <td className="px-4 py-4 text-sm font-semibold text-[var(--ink)]">{aluno.rejeitados}</td>
                                            <td className="px-4 py-4 text-sm font-semibold text-[var(--ink)]">{aluno.horasValidadas}h</td>
                                            <td className="px-5 py-4">
                                                <span className="rounded-full bg-[var(--panel-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                                                    {aluno.totalCertificados} registros
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-5 space-y-3 lg:hidden">
                            {alunosPaginados.map((aluno) => (
                                <MobileStudentRow key={aluno.id} aluno={aluno} />
                            ))}
                        </div>

                        <div className="mt-5 flex flex-col gap-3 border-t border-[var(--line)] pt-5 md:flex-row md:items-center md:justify-between">
                            <p className="text-sm text-[var(--muted)]">
                                Mostrando {startIndex + 1} a {Math.min(startIndex + ROWS_PER_PAGE, alunosFiltrados.length)} de {alunosFiltrados.length} alunos
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    disabled={safeCurrentPage === 1}
                                    className="rounded-2xl border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Anterior
                                </button>
                                <div className="flex items-center rounded-2xl bg-[var(--panel-soft)] px-4 text-sm font-semibold text-[var(--ink)]">
                                    {safeCurrentPage} / {totalPages}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                    disabled={safeCurrentPage === totalPages}
                                    className="rounded-2xl border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Proxima
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="mt-5 rounded-[1.6rem] border border-dashed border-[var(--line-strong)] bg-[var(--panel-soft)] p-8 text-center text-[var(--muted)]">
                        Nenhum aluno encontrado para este filtro.
                    </div>
                )}
            </section>

            <section id="cadastro-aluno" className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <form
                    onSubmit={handleCadastrarAluno}
                    className="rounded-[2rem] border border-[var(--line)] bg-white p-8 shadow-[0_24px_56px_rgba(41,47,56,0.1)]"
                >
                    <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--ink)]">
                        <UserPlus2 className="text-[var(--brand-red)]" />
                        Cadastrar aluno
                    </h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                        O aluno ja entra no sistema vinculado ao professor logado.
                    </p>

                    <div className="mt-7 space-y-4">
                        <input
                            type="text"
                            required
                            value={novoAluno.nome}
                            onChange={(event) => setNovoAluno((estadoAtual) => ({ ...estadoAtual, nome: event.target.value }))}
                            placeholder="Nome completo"
                            className="h-14 w-full rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] px-4 text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand-red)]"
                        />
                        <input
                            type="email"
                            required
                            value={novoAluno.email}
                            onChange={(event) => setNovoAluno((estadoAtual) => ({ ...estadoAtual, email: event.target.value }))}
                            placeholder="E-mail do aluno"
                            className="h-14 w-full rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] px-4 text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand-red)]"
                        />
                        <input
                            type="password"
                            required
                            value={novoAluno.senha}
                            onChange={(event) => setNovoAluno((estadoAtual) => ({ ...estadoAtual, senha: event.target.value }))}
                            placeholder="Senha inicial"
                            className="h-14 w-full rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] px-4 text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand-red)]"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={cadastrarAlunoMutation.isPending}
                        className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand-red)] font-bold text-white transition-colors hover:bg-[var(--brand-red-dark)] disabled:cursor-not-allowed disabled:bg-[#b8b8bb]"
                    >
                        {cadastrarAlunoMutation.isPending ? 'Salvando...' : 'Cadastrar e vincular'}
                    </button>
                </form>

                <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,#4b545f_0%,#343b44_100%)] p-8 text-white shadow-[0_28px_60px_rgba(36,42,50,0.24)]">
                    <span className="inline-flex text-xs font-semibold uppercase tracking-[0.28em] text-[#ffd7dc]">
                        Operacao de alunos
                    </span>
                    <div className="mt-8 grid gap-4">
                        <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
                            <UsersRound className="mb-3 text-[#ffb4bc]" size={24} />
                            <h3 className="font-bold">Visual mais limpo</h3>
                            <p className="mt-2 text-sm leading-6 text-[#d8dde3]">
                                A lista foi compactada para suportar turmas maiores com busca e paginação.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
                            <GraduationCap className="mb-3 text-[#ffb4bc]" size={24} />
                            <h3 className="font-bold">Base centralizada</h3>
                            <p className="mt-2 text-sm leading-6 text-[#d8dde3]">
                                Todo aluno criado aqui ja nasce conectado ao professor para envio e acompanhamento dos certificados.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
                            <Mail className="mb-3 text-[#ffb4bc]" size={24} />
                            <h3 className="font-bold">Acesso inicial</h3>
                            <p className="mt-2 text-sm leading-6 text-[#d8dde3]">
                                Defina um e-mail valido e uma senha inicial para o primeiro acesso do aluno.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </ProfessorLayout>
    );
}
