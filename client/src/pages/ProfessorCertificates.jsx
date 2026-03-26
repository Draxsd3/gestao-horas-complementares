import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    BadgeCheck,
    BadgeX,
    Clock3,
    FileCheck2,
    PencilLine,
    Search
} from 'lucide-react';
import api from '../api/api';
import ProfessorLayout from '../components/ProfessorLayout';
import TransitionLoader from '../components/TransitionLoader';
import { getStoredUser } from '../utils/session';

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

function CertificateForm({
    certificado,
    avaliacao,
    grupos,
    onFieldChange,
    onApprove,
    onReject,
    isPending
}) {
    return (
        <div className="mt-5 space-y-4 border-t border-[var(--line)] pt-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_0.35fr]">
                <select
                    value={avaliacao.grupoId || ''}
                    onChange={(event) => onFieldChange('grupoId', event.target.value)}
                    className="h-14 rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] px-4 text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand-red)]"
                >
                    <option value="">Selecione o grupo</option>
                    {grupos?.map((grupo) => (
                        <option key={grupo.id} value={grupo.id}>
                            {grupo.numero} - {grupo.descricao}
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    min="0"
                    max={certificado.horas}
                    value={avaliacao.horasValidadas || ''}
                    onChange={(event) => onFieldChange('horasValidadas', event.target.value)}
                    className="h-14 rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] px-4 text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand-red)]"
                    placeholder="Horas validadas"
                />
            </div>

            <textarea
                value={avaliacao.observacaoProfessor || ''}
                onChange={(event) => onFieldChange('observacaoProfessor', event.target.value)}
                placeholder="Observacao do professor"
                className="min-h-28 w-full rounded-[1.5rem] border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-3 text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand-red)]"
            />

            <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={onReject}
                    disabled={isPending}
                    className="rounded-2xl border border-[var(--line-strong)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Rejeitar
                </button>
                <button
                    type="button"
                    onClick={onApprove}
                    disabled={isPending}
                    className="rounded-2xl bg-[var(--brand-red)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-red-dark)] disabled:cursor-not-allowed disabled:bg-[#b8b8bb]"
                >
                    Aprovar e validar horas
                </button>
            </div>
        </div>
    );
}

function CertificateCard({
    certificado,
    grupos,
    avaliacao,
    isEditing,
    onFieldChange,
    onEdit,
    onApprove,
    onReject,
    mutationPending
}) {
    const arquivoCompleto = `${api.defaults.baseURL}${certificado.arquivoUrl}`;
    const isResolved = certificado.status === 'APROVADO' || certificado.status === 'REJEITADO';

    return (
        <article
            className={`group rounded-[1.8rem] border border-[var(--line)] p-5 shadow-[0_18px_35px_rgba(44,52,61,0.06)] transition-all duration-200 ${
                isResolved && !isEditing
                    ? 'bg-[#eef1f4] opacity-55 hover:bg-white hover:opacity-100'
                    : 'bg-white'
            }`}
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-[var(--ink)]">{certificado.titulo}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${getStatusBadge(certificado.status)}`}>
                            {getStatusLabel(certificado.status)}
                        </span>
                        {isResolved && !isEditing ? (
                            <button
                                type="button"
                                onClick={onEdit}
                                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold text-[var(--ink)] opacity-0 transition-opacity hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] group-hover:opacity-100"
                            >
                                <PencilLine size={14} />
                                Editar
                            </button>
                        ) : null}
                    </div>

                    <div className="mt-3 inline-flex flex-col rounded-2xl bg-[var(--panel-soft)] px-4 py-3">
                        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Aluno</span>
                        <strong className="mt-1 text-base font-bold text-[var(--ink)]">{certificado.aluno.nome}</strong>
                        <span className="mt-1 text-sm text-[var(--muted)]">
                            {certificado.aluno.rm ? `RM ${certificado.aluno.rm}` : (certificado.aluno.email || 'Sem identificador informado')}
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                        Grupo atual: {certificado.grupo.numero} - {certificado.grupo.descricao}
                    </p>
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

            {isResolved && !isEditing ? (
                <div className="mt-5 flex flex-col gap-2 border-t border-[var(--line)] pt-4 text-sm text-[var(--muted)]">
                    <p>
                        {certificado.dataAnalise ? (
                            <>
                                Avaliado em{' '}
                                {new Intl.DateTimeFormat('pt-BR', {
                                    dateStyle: 'short',
                                    timeStyle: 'short'
                                }).format(new Date(certificado.dataAnalise))}
                                {certificado.analisadoPor?.nome ? ` por ${certificado.analisadoPor.nome}` : ''}
                            </>
                        ) : (
                            'Avaliacao concluida.'
                        )}
                    </p>
                    {certificado.observacaoProfessor ? (
                        <p className="rounded-2xl bg-[var(--panel-soft)] px-4 py-3 text-[var(--ink)]">
                            {certificado.observacaoProfessor}
                        </p>
                    ) : null}
                </div>
            ) : (
                <CertificateForm
                    certificado={certificado}
                    avaliacao={avaliacao}
                    grupos={grupos}
                    onFieldChange={onFieldChange}
                    onApprove={onApprove}
                    onReject={onReject}
                    isPending={mutationPending}
                />
            )}
        </article>
    );
}

export default function ProfessorCertificates() {
    const queryClient = useQueryClient();
    const usuario = getStoredUser();
    const [avaliacoes, setAvaliacoes] = useState({});
    const [editingIds, setEditingIds] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('TODOS');

    const { data: certificados, isLoading: loadingCertificados, error: errorCertificados } = useQuery({
        queryKey: ['professor-certificados', usuario?.id],
        queryFn: async () => {
            const response = await api.get(`/professor/certificados/${usuario.id}`);
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

    const avaliarCertificadoMutation = useMutation({
        mutationFn: ({ certificadoId, payload }) => api.patch(`/professor/certificados/${certificadoId}`, payload),
        onSuccess: (_, { certificadoId }) => {
            setEditingIds((estadoAtual) => ({
                ...estadoAtual,
                [certificadoId]: false
            }));
            queryClient.invalidateQueries({ queryKey: ['professor-dashboard', usuario.id] });
            queryClient.invalidateQueries({ queryKey: ['professor-alunos', usuario.id] });
            queryClient.invalidateQueries({ queryKey: ['professor-certificados', usuario.id] });
            alert('Certificado atualizado com sucesso.');
        },
        onError: (errorResponse) => {
            alert(errorResponse.response?.data?.error || 'Erro ao atualizar certificado.');
        }
    });

    const updateAvaliacao = (certificadoId, field, value) => {
        setAvaliacoes((estadoAtual) => ({
            ...estadoAtual,
            [certificadoId]: {
                ...estadoAtual[certificadoId],
                [field]: value
            }
        }));
    };

    const abrirEdicao = (certificado) => {
        setEditingIds((estadoAtual) => ({
            ...estadoAtual,
            [certificado.id]: true
        }));

        setAvaliacoes((estadoAtual) => ({
            ...estadoAtual,
            [certificado.id]: estadoAtual[certificado.id] || {
                grupoId: String(certificado.grupo?.id || certificado.grupoId || ''),
                horasValidadas: String(certificado.horasValidadas ?? certificado.horas),
                observacaoProfessor: certificado.observacaoProfessor || ''
            }
        }));
    };

    const handleAvaliar = (certificado, status) => {
        const avaliacao = avaliacoes[certificado.id] || {};
        const payload = {
            professorId: usuario.id,
            status,
            grupoId: Number(avaliacao.grupoId || certificado.grupo?.id || certificado.grupoId),
            observacaoProfessor: avaliacao?.observacaoProfessor || ''
        };

        if (status === 'APROVADO') {
            payload.horasValidadas = Number(avaliacao.horasValidadas || certificado.horasValidadas || certificado.horas);
        }

        avaliarCertificadoMutation.mutate({ certificadoId: certificado.id, payload });
    };

    const certificadosFiltrados = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        return (certificados || []).filter((certificado) => {
            const matchesStatus = statusFilter === 'TODOS' || certificado.status === statusFilter;
            const matchesSearch = !term
                || certificado.titulo.toLowerCase().includes(term)
                || certificado.aluno.nome.toLowerCase().includes(term)
                || (certificado.aluno.rm || '').toLowerCase().includes(term)
                || (certificado.aluno.email || '').toLowerCase().includes(term)
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

    if (loadingCertificados || loadingGrupos) {
        return <TransitionLoader label="Carregando certificados..." />;
    }

    if (errorCertificados || errorGrupos) {
        return <div className="mt-20 text-center text-[var(--brand-red)]">Erro ao carregar certificados.</div>;
    }

    return (
        <ProfessorLayout
            title="Certificados recebidos"
            subtitle="Analise comprovantes enviados, ajuste o enquadramento e valide horas."
        >
            <section className="rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,#4b545f_0%,#343b44_100%)] p-8 text-white shadow-[0_28px_60px_rgba(36,42,50,0.24)]">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
                        <Clock3 className="mb-3 text-[#ffb4bc]" size={24} />
                        <h3 className="font-bold">Pendentes em destaque</h3>
                        <p className="mt-2 text-sm leading-6 text-[#d8dde3]">Os itens ainda nao avaliados continuam abertos para decisao rapida.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
                        <BadgeCheck className="mb-3 text-[#ffb4bc]" size={24} />
                        <h3 className="font-bold">Aprovados discretos</h3>
                        <p className="mt-2 text-sm leading-6 text-[#d8dde3]">Cards aprovados ficam suavizados e so reabrem quando voce quiser editar.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
                        <BadgeX className="mb-3 text-[#ffb4bc]" size={24} />
                        <h3 className="font-bold">Rejeicoes revisaveis</h3>
                        <p className="mt-2 text-sm leading-6 text-[#d8dde3]">Passe o mouse e use editar para reavaliar um certificado rejeitado.</p>
                    </div>
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
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-red)]">Fila de analise</p>
                        <h2 className="mt-2 text-2xl font-bold text-[var(--ink)]">Certificados do professor</h2>
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
                                placeholder="Buscar por titulo, aluno, RM ou grupo"
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
                        {certificadosFiltrados.map((certificado) => {
                            const avaliacao = avaliacoes[certificado.id] || {
                                grupoId: String(certificado.grupo?.id || certificado.grupoId || ''),
                                horasValidadas: String(certificado.horasValidadas ?? certificado.horas),
                                observacaoProfessor: certificado.observacaoProfessor || ''
                            };
                            const isEditing = certificado.status === 'PENDENTE' || !!editingIds[certificado.id];

                            return (
                                <CertificateCard
                                    key={certificado.id}
                                    certificado={certificado}
                                    grupos={grupos}
                                    avaliacao={avaliacao}
                                    isEditing={isEditing}
                                    onFieldChange={(field, value) => updateAvaliacao(certificado.id, field, value)}
                                    onEdit={() => abrirEdicao(certificado)}
                                    onApprove={() => handleAvaliar(certificado, 'APROVADO')}
                                    onReject={() => handleAvaliar(certificado, 'REJEITADO')}
                                    mutationPending={avaliarCertificadoMutation.isPending}
                                />
                            );
                        })}
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
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Revisao visual</p>
                        <p className="text-sm text-[var(--muted)]">Itens concluidos perdem destaque sem sair da fila.</p>
                    </div>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-[var(--panel-soft)] p-4">
                        <strong className="text-base font-bold text-[var(--ink)]">1. Pendentes abertos</strong>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Os certificados novos seguem prontos para analise imediata.</p>
                    </div>
                    <div className="rounded-2xl bg-[var(--panel-soft)] p-4">
                        <strong className="text-base font-bold text-[var(--ink)]">2. Cards suavizados</strong>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Aprovados e rejeitados ficam discretos para reduzir poluicao visual.</p>
                    </div>
                    <div className="rounded-2xl bg-[var(--panel-soft)] p-4">
                        <strong className="text-base font-bold text-[var(--ink)]">3. Edicao por hover</strong>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Passe o mouse e use editar para reabrir a avaliacao do card.</p>
                    </div>
                </div>
            </section>
        </ProfessorLayout>
    );
}
