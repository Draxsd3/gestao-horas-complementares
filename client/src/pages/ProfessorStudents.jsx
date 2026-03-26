import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChartColumn, Download, FileUp, GraduationCap, IdCard, Search, Upload, UserPlus2, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import ProfessorLayout from '../components/ProfessorLayout';
import TransitionLoader from '../components/TransitionLoader';
import { getStoredUser } from '../utils/session';

const ROWS_PER_PAGE = 8;
const SERIE_OPTIONS = ['1a Serie', '2a Serie', '3a Serie'];

function getStudentIdentifierLabel(aluno) {
    return aluno?.rm ? `RM ${aluno.rm}` : 'RM nao informado';
}

function SummaryBadge({ label, value }) {
    return (
        <div className="rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-4 shadow-[0_14px_30px_rgba(44,52,61,0.05)]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
            <strong className="mt-2 block text-2xl font-bold text-[var(--ink)]">{value}</strong>
        </div>
    );
}

function ProgressGroupCard({ grupo }) {
    return (
        <article className="rounded-[1.4rem] border border-[var(--line)] bg-white p-4 shadow-[0_14px_28px_rgba(44,52,61,0.05)]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <span className="inline-flex rounded-full bg-[#eef1f4] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                        Grupo {grupo.numero}
                    </span>
                    <h4 className="mt-3 text-base font-bold text-[var(--ink)]">{grupo.descricao}</h4>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${grupo.concluido ? 'bg-[#eaf7ef] text-[#2f8f57]' : 'bg-[#fff4e6] text-[#c97a16]'}`}>
                    {grupo.percentual}%
                </span>
            </div>

            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-[#e4e8ec]">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${Math.max(grupo.percentual, grupo.percentual > 0 ? 8 : 0)}%`,
                        background: grupo.concluido
                            ? 'linear-gradient(90deg, #3c9b5f 0%, #6dc98d 100%)'
                            : 'linear-gradient(90deg, #ce1126 0%, #f04b58 100%)'
                    }}
                />
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
                <span>{grupo.horasAprovadas}/{grupo.horasMaximas}h</span>
                <span>{grupo.totalCertificadosAprovados} certificado(s) aprovado(s)</span>
                {!grupo.concluido ? <span>Faltam {grupo.horasFaltantes}h</span> : <span>Carga concluida</span>}
            </div>
        </article>
    );
}

function MobileStudentRow({ aluno, onOpenPerformance }) {
    return (
        <article className="rounded-[1.5rem] border border-[var(--line)] bg-white p-4 shadow-[0_14px_28px_rgba(44,52,61,0.05)]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-base font-bold text-[var(--ink)]">{aluno.nome}</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">{getStudentIdentifierLabel(aluno)}</p>
                    <span className="mt-3 inline-flex rounded-full bg-[var(--brand-red-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-red)]">
                        {aluno.serie || 'Sem serie'}
                    </span>
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
            <button
                type="button"
                onClick={onOpenPerformance}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)]"
            >
                <ChartColumn size={16} />
                Ver desempenho
            </button>
        </article>
    );
}

export default function ProfessorStudents() {
    const queryClient = useQueryClient();
    const usuario = getStoredUser();
    const navigate = useNavigate();
    const [novoAluno, setNovoAluno] = useState({
        nome: '',
        rm: '',
        serie: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [serieFilter, setSerieFilter] = useState('TODAS');
    const [currentPage, setCurrentPage] = useState(1);
    const [arquivoImportacao, setArquivoImportacao] = useState(null);
    const [serieImportacao, setSerieImportacao] = useState('');
    const [importResult, setImportResult] = useState(null);

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
            setNovoAluno({ nome: '', rm: '', serie: '' });
            setImportResult(null);
            queryClient.invalidateQueries({ queryKey: ['professor-dashboard', usuario.id] });
            queryClient.invalidateQueries({ queryKey: ['professor-alunos', usuario.id] });
            alert('Aluno cadastrado com a senha padrao Aluno@123.');
        },
        onError: (errorResponse) => {
            alert(errorResponse.response?.data?.error || 'Erro ao cadastrar aluno.');
        }
    });

    const importarAlunosMutation = useMutation({
        mutationFn: (formData) => api.post('/professor/alunos/importar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        onSuccess: (response) => {
            setArquivoImportacao(null);
            setSerieImportacao('');
            setImportResult(response.data);
            queryClient.invalidateQueries({ queryKey: ['professor-dashboard', usuario.id] });
            queryClient.invalidateQueries({ queryKey: ['professor-alunos', usuario.id] });
            alert(`Importacao concluida: ${response.data.createdCount} aluno(s) criado(s).`);
        },
        onError: (errorResponse) => {
            setImportResult(null);
            alert(errorResponse.response?.data?.error || 'Erro ao importar planilha.');
        }
    });

    const handleCadastrarAluno = (event) => {
        event.preventDefault();
        cadastrarAlunoMutation.mutate({
            ...novoAluno,
            professorId: usuario.id
        });
    };

    const handleImportarAlunos = (event) => {
        event.preventDefault();

        if (!arquivoImportacao) {
            alert('Selecione uma planilha para importar.');
            return;
        }

        const formData = new FormData();
        formData.append('professorId', usuario.id);
        formData.append('arquivo', arquivoImportacao);
        if (serieImportacao) {
            formData.append('serie', serieImportacao);
        }
        importarAlunosMutation.mutate(formData);
    };

    const handleBaixarModelo = () => {
        const csvContent = [
            'RM,Alunos',
            '20262390153,Aluno Exemplo',
            '20262390023,Maria da Silva'
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'modelo-importacao-alunos.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleOpenPerformance = (alunoId) => {
        navigate(`/professor/alunos/listagem?aluno=${alunoId}`);
    };

    const alunosFiltrados = (alunos || []).filter((aluno) => {
        const term = searchTerm.trim().toLowerCase();
        const matchesSerie = serieFilter === 'TODAS' || aluno.serie === serieFilter;
        const matchesSearch = !term
            || aluno.nome.toLowerCase().includes(term)
            || (aluno.rm || '').toLowerCase().includes(term)
            || (aluno.serie || '').toLowerCase().includes(term);

        return matchesSerie && matchesSearch;
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
                { label: 'Desempenho', onClick: () => navigate('/professor/alunos/listagem') },
                { label: 'Cadastrar aluno', onClick: () => document.getElementById('cadastro-aluno')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) },
            ]}
        >
            <section className="grid gap-4 md:grid-cols-3">
                <SummaryBadge label="Alunos exibidos" value={alunosFiltrados.length} />
                <SummaryBadge label="Pendencias" value={totalPendentes} />
                <SummaryBadge label="Horas validadas" value={`${totalHoras}h`} />
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <form
                    onSubmit={handleImportarAlunos}
                    className="rounded-[2rem] border border-[var(--line)] bg-white p-8 shadow-[0_24px_56px_rgba(41,47,56,0.1)]"
                >
                    <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--ink)]">
                        <Upload className="text-[var(--brand-red)]" />
                        Importar alunos por planilha
                    </h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                        Envie a planilha oficial com as colunas `RM` e `Alunos`.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleBaixarModelo}
                            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] px-4 py-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)]"
                        >
                            <Download size={18} />
                            Baixar modelo
                        </button>
                    </div>

                    <div className="mt-6 rounded-[1.75rem] border-2 border-dashed border-[var(--line-strong)] bg-[var(--panel-soft)] p-6 transition-colors hover:border-[var(--brand-red)]">
                        <label className="flex cursor-pointer flex-col gap-3 text-sm text-[var(--muted)]">
                            <span className="font-semibold text-[var(--ink)]">Planilha de alunos</span>
                            <span>O sistema vai ler `RM` e `Alunos` automaticamente.</span>
                            <span>Todos os alunos importados receberao a senha inicial `Aluno@123`.</span>
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                className="w-full text-sm text-[var(--muted)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--brand-red)] file:px-4 file:py-2 file:font-semibold file:text-white"
                                onChange={(event) => setArquivoImportacao(event.target.files?.[0] || null)}
                            />
                            {arquivoImportacao ? (
                                <span className="text-sm font-medium text-[var(--ink)]">
                                    Arquivo selecionado: {arquivoImportacao.name}
                                </span>
                            ) : null}
                        </label>

                        <select
                            value={serieImportacao}
                            onChange={(event) => setSerieImportacao(event.target.value)}
                            className="mt-4 h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand-red)]"
                        >
                            <option value="">Serie opcional para toda a turma</option>
                            {SERIE_OPTIONS.map((serie) => (
                                <option key={serie} value={serie}>{serie}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={importarAlunosMutation.isPending}
                        className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand-red)] font-bold text-white transition-colors hover:bg-[var(--brand-red-dark)] disabled:cursor-not-allowed disabled:bg-[#b8b8bb]"
                    >
                        {importarAlunosMutation.isPending ? 'Importando...' : <><FileUp size={18} /> Importar planilha</>}
                    </button>

                    {importResult ? (
                        <div className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-[var(--panel-soft)] p-5">
                            <div className="grid gap-3 md:grid-cols-3">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Linhas lidas</p>
                                    <strong className="mt-2 block text-2xl font-bold text-[var(--ink)]">{importResult.totalRows}</strong>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Criados</p>
                                    <strong className="mt-2 block text-2xl font-bold text-[#2f8f57]">{importResult.createdCount}</strong>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Ignorados</p>
                                    <strong className="mt-2 block text-2xl font-bold text-[var(--brand-red)]">{importResult.skippedCount}</strong>
                                </div>
                            </div>

                            {importResult.errors?.length ? (
                                <div className="mt-5">
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Ocorrencias</p>
                                    <div className="mt-3 space-y-2">
                                        {importResult.errors.slice(0, 8).map((errorItem, index) => (
                                            <div key={`${index}-${errorItem}`} className="rounded-2xl border border-[var(--brand-red)] bg-[var(--brand-red-soft)] px-4 py-3 text-sm text-[var(--brand-red)]">
                                                {errorItem}
                                            </div>
                                        ))}
                                        {importResult.errors.length > 8 ? (
                                            <p className="text-sm text-[var(--muted)]">
                                                E mais {importResult.errors.length - 8} ocorrencia(s) na importacao.
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </form>

                <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,#4b545f_0%,#343b44_100%)] p-8 text-white shadow-[0_28px_60px_rgba(36,42,50,0.24)]">
                    <span className="inline-flex text-xs font-semibold uppercase tracking-[0.28em] text-[#ffd7dc]">
                        Importacao em lote
                    </span>
                    <div className="mt-8 grid gap-4">
                        <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
                            <UsersRound className="mb-3 text-[#ffb4bc]" size={24} />
                            <h3 className="font-bold">Cadastro mais rapido</h3>
                            <p className="mt-2 text-sm leading-6 text-[#d8dde3]">
                                Ideal para subir turmas inteiras de uma vez sem repetir o cadastro manual aluno por aluno.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
                            <GraduationCap className="mb-3 text-[#ffb4bc]" size={24} />
                            <h3 className="font-bold">Validacao por linha</h3>
                            <p className="mt-2 text-sm leading-6 text-[#d8dde3]">
                                O sistema informa quais linhas entraram e quais precisam de correcao por RM duplicado ou serie invalida.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
                            <IdCard className="mb-3 text-[#ffb4bc]" size={24} />
                            <h3 className="font-bold">Acesso inicial definido</h3>
                            <p className="mt-2 text-sm leading-6 text-[#d8dde3]">
                                O aluno entra com o RM da planilha e a senha `Aluno@123`, trocando a senha no primeiro acesso.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-[1.8rem] border border-[var(--line)] bg-white p-5 shadow-[0_18px_35px_rgba(44,52,61,0.06)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-red)]">Base de alunos</p>
                        <h2 className="mt-2 text-2xl font-bold text-[var(--ink)]">Lista compacta e pesquisavel</h2>
                    </div>

                    <div className="flex w-full flex-col gap-3 lg:max-w-2xl lg:flex-row">
                        <label className="flex flex-1 items-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--panel-soft)]">
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
                                placeholder="Buscar por nome, RM ou serie"
                                className="h-12 flex-1 bg-transparent pr-4 text-sm text-[var(--ink)] outline-none"
                            />
                        </label>

                        <select
                            value={serieFilter}
                            onChange={(event) => {
                                setSerieFilter(event.target.value);
                                setCurrentPage(1);
                            }}
                            className="h-12 rounded-full border border-[var(--line)] bg-[var(--panel-soft)] px-4 text-sm font-semibold text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand-red)]"
                        >
                            <option value="TODAS">Todas as series</option>
                            {SERIE_OPTIONS.map((serie) => (
                                <option key={serie} value={serie}>{serie}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {alunosFiltrados.length ? (
                    <>
                        <div className="mt-5 hidden overflow-hidden rounded-[1.6rem] border border-[var(--line)] lg:block">
                            <table className="min-w-full border-collapse">
                                <thead className="bg-[var(--panel-soft)] text-left">
                                    <tr>
                                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Aluno</th>
                                        <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Serie</th>
                                        <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Pendentes</th>
                                        <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Aprovados</th>
                                        <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Rejeitados</th>
                                        <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Horas</th>
                                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Certificados</th>
                                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Desempenho</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alunosPaginados.map((aluno, index) => (
                                        <tr key={aluno.id} className={index !== alunosPaginados.length - 1 ? 'border-b border-[var(--line)]' : ''}>
                                            <td className="px-5 py-4">
                                                <strong className="block text-sm font-bold text-[var(--ink)]">{aluno.nome}</strong>
                                                <span className="mt-1 block text-sm text-[var(--muted)]">{getStudentIdentifierLabel(aluno)}</span>
                                            </td>
                                            <td className="px-4 py-4 text-sm font-semibold text-[var(--ink)]">{aluno.serie || '-'}</td>
                                            <td className="px-4 py-4 text-sm font-semibold text-[var(--ink)]">{aluno.pendentes}</td>
                                            <td className="px-4 py-4 text-sm font-semibold text-[var(--ink)]">{aluno.aprovados}</td>
                                            <td className="px-4 py-4 text-sm font-semibold text-[var(--ink)]">{aluno.rejeitados}</td>
                                            <td className="px-4 py-4 text-sm font-semibold text-[var(--ink)]">{aluno.horasValidadas}h</td>
                                            <td className="px-5 py-4">
                                                <span className="rounded-full bg-[var(--panel-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                                                    {aluno.totalCertificados} registros
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenPerformance(aluno.id)}
                                                    className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)]"
                                                >
                                                    <ChartColumn size={16} />
                                                    Ver desempenho
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-5 space-y-3 lg:hidden">
                            {alunosPaginados.map((aluno) => (
                                <MobileStudentRow
                                    key={aluno.id}
                                    aluno={aluno}
                                    onOpenPerformance={() => handleOpenPerformance(aluno.id)}
                                />
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
                        O aluno entra vinculado ao professor logado, usa o RM como acesso e recebe a senha inicial `Aluno@123`.
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
                            type="text"
                            required
                            value={novoAluno.rm}
                            onChange={(event) => setNovoAluno((estadoAtual) => ({ ...estadoAtual, rm: event.target.value }))}
                            placeholder="RM do aluno"
                            className="h-14 w-full rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] px-4 text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand-red)]"
                        />
                        <select
                            value={novoAluno.serie}
                            onChange={(event) => setNovoAluno((estadoAtual) => ({ ...estadoAtual, serie: event.target.value }))}
                            className="h-14 w-full rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] px-4 text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand-red)]"
                        >
                            <option value="">Sem serie definida</option>
                            {SERIE_OPTIONS.map((serie) => (
                                <option key={serie} value={serie}>{serie}</option>
                            ))}
                        </select>
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
                                Todo aluno criado aqui ja nasce conectado ao professor, com RM definido e serie opcional para facilitar filtro e acompanhamento.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
                            <IdCard className="mb-3 text-[#ffb4bc]" size={24} />
                            <h3 className="font-bold">Acesso inicial</h3>
                            <p className="mt-2 text-sm leading-6 text-[#d8dde3]">
                                O primeiro acesso do aluno acontece com o RM cadastrado e a senha padrao `Aluno@123`.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </ProfessorLayout>
    );
}
