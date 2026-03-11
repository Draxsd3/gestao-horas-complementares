import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GraduationCap, Mail, UserPlus2 } from 'lucide-react';
import api from '../api/api';
import ProfessorLayout from '../components/ProfessorLayout';
import TransitionLoader from '../components/TransitionLoader';
import { getStoredUser } from '../utils/session';

function StudentCard({ aluno }) {
    return (
        <article className="rounded-[1.7rem] border border-[var(--line)] bg-white p-5 shadow-[0_18px_35px_rgba(44,52,61,0.06)]">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-[var(--ink)]">{aluno.nome}</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">{aluno.email}</p>
                </div>
                <span className="rounded-full bg-[var(--panel-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                    {aluno.totalCertificados} certificados
                </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[var(--panel-soft)] p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--muted)]">Pendentes</p>
                    <strong className="mt-2 block text-2xl font-bold text-[var(--ink)]">{aluno.pendentes}</strong>
                </div>
                <div className="rounded-2xl bg-[var(--panel-soft)] p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--muted)]">Aprovados</p>
                    <strong className="mt-2 block text-2xl font-bold text-[var(--ink)]">{aluno.aprovados}</strong>
                </div>
            </div>

            <div className="mt-3 rounded-2xl border border-[var(--line)] px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--muted)]">Horas validadas</p>
                <strong className="mt-2 block text-2xl font-bold text-[var(--ink)]">{aluno.horasValidadas}h</strong>
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
        >
            <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
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
                    <div className="mt-8 space-y-4">
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

            <section className="space-y-5">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-red)]">Base de alunos</p>
                    <h2 className="mt-2 text-2xl font-bold text-[var(--ink)]">Alunos atualmente vinculados</h2>
                </div>

                {alunos?.length ? (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {alunos.map((aluno) => (
                            <StudentCard key={aluno.id} aluno={aluno} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-[1.7rem] border border-dashed border-[var(--line-strong)] bg-white p-8 text-center text-[var(--muted)]">
                        Nenhum aluno vinculado ainda.
                    </div>
                )}
            </section>
        </ProfessorLayout>
    );
}
