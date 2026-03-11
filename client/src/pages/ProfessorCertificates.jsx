import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, BadgeX, FileCheck2 } from 'lucide-react';
import api from '../api/api';
import ProfessorLayout from '../components/ProfessorLayout';
import TransitionLoader from '../components/TransitionLoader';
import { getStoredUser } from '../utils/session';

function getStatusLabel(status) {
    if (status === 'APROVADO') return 'Aprovado';
    if (status === 'REJEITADO') return 'Rejeitado';
    return 'Pendente';
}

function getStatusClasses(status) {
    if (status === 'APROVADO') return 'bg-[#eaf7ef] text-[#2f8f57]';
    if (status === 'REJEITADO') return 'bg-[var(--brand-red-soft)] text-[var(--brand-red)]';
    return 'bg-[#fff4e6] text-[#c97a16]';
}

export default function ProfessorCertificates() {
    const queryClient = useQueryClient();
    const usuario = getStoredUser();
    const [avaliacoes, setAvaliacoes] = useState({});

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
        onSuccess: () => {
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

    const handleAvaliar = (certificadoId, status) => {
        const avaliacao = avaliacoes[certificadoId];
        const payload = {
            professorId: usuario.id,
            status,
            grupoId: Number(avaliacao?.grupoId),
            observacaoProfessor: avaliacao?.observacaoProfessor || ''
        };

        if (status === 'APROVADO') {
            payload.horasValidadas = Number(avaliacao?.horasValidadas);
        }

        avaliarCertificadoMutation.mutate({ certificadoId, payload });
    };

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
                        <FileCheck2 className="mb-3 text-[#ffb4bc]" size={24} />
                        <h3 className="font-bold">Ajuste o grupo</h3>
                        <p className="mt-2 text-sm leading-6 text-[#d8dde3]">Reenquadre a atividade antes de concluir a analise.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
                        <BadgeCheck className="mb-3 text-[#ffb4bc]" size={24} />
                        <h3 className="font-bold">Valide a carga</h3>
                        <p className="mt-2 text-sm leading-6 text-[#d8dde3]">Aprovacoes podem registrar menos horas que o solicitado.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
                        <BadgeX className="mb-3 text-[#ffb4bc]" size={24} />
                        <h3 className="font-bold">Registre observacoes</h3>
                        <p className="mt-2 text-sm leading-6 text-[#d8dde3]">Deixe um historico claro para rejeicoes e ajustes feitos.</p>
                    </div>
                </div>
            </section>

            <section className="space-y-5">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-red)]">Fila de analise</p>
                    <h2 className="mt-2 text-2xl font-bold text-[var(--ink)]">Certificados do professor</h2>
                </div>

                {certificados?.length ? (
                    <div className="space-y-5">
                        {certificados.map((certificado) => {
                            const avaliacao = avaliacoes[certificado.id] || {
                                grupoId: String(certificado.grupo?.id || certificado.grupoId || ''),
                                horasValidadas: String(certificado.horasValidadas ?? certificado.horas),
                                observacaoProfessor: certificado.observacaoProfessor || ''
                            };
                            const arquivoCompleto = `${api.defaults.baseURL}${certificado.arquivoUrl}`;

                            return (
                                <article
                                    key={certificado.id}
                                    className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_20px_40px_rgba(44,52,61,0.06)]"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h3 className="text-xl font-bold text-[var(--ink)]">{certificado.titulo}</h3>
                                                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${getStatusClasses(certificado.status)}`}>
                                                    {getStatusLabel(certificado.status)}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-[var(--muted)]">
                                                Aluno: {certificado.aluno.nome} ({certificado.aluno.email})
                                            </p>
                                            <p className="mt-1 text-sm text-[var(--muted)]">
                                                Grupo atual: {certificado.grupo.numero} - {certificado.grupo.descricao}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <span className="rounded-full bg-[var(--panel-soft)] px-3 py-2 text-sm font-semibold text-[var(--ink)]">
                                                Solicitado: {certificado.horas}h
                                            </span>
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

                                    <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.4fr]">
                                        <select
                                            value={avaliacao.grupoId || ''}
                                            onChange={(event) => updateAvaliacao(certificado.id, 'grupoId', event.target.value)}
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
                                            onChange={(event) => updateAvaliacao(certificado.id, 'horasValidadas', event.target.value)}
                                            className="h-14 rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] px-4 text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand-red)]"
                                            placeholder="Horas validadas"
                                        />
                                    </div>

                                    <textarea
                                        value={avaliacao.observacaoProfessor || ''}
                                        onChange={(event) => updateAvaliacao(certificado.id, 'observacaoProfessor', event.target.value)}
                                        placeholder="Observacao do professor"
                                        className="mt-4 min-h-28 w-full rounded-[1.5rem] border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-3 text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand-red)]"
                                    />

                                    <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div className="text-sm text-[var(--muted)]">
                                            {certificado.dataAnalise ? (
                                                <>
                                                    Ultima analise em{' '}
                                                    {new Intl.DateTimeFormat('pt-BR', {
                                                        dateStyle: 'short',
                                                        timeStyle: 'short'
                                                    }).format(new Date(certificado.dataAnalise))}
                                                    {certificado.analisadoPor?.nome ? ` por ${certificado.analisadoPor.nome}` : ''}
                                                </>
                                            ) : (
                                                'Aguardando primeira analise.'
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleAvaliar(certificado.id, 'REJEITADO')}
                                                disabled={avaliarCertificadoMutation.isPending}
                                                className="rounded-2xl border border-[var(--line-strong)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                Rejeitar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleAvaliar(certificado.id, 'APROVADO')}
                                                disabled={avaliarCertificadoMutation.isPending}
                                                className="rounded-2xl bg-[var(--brand-red)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-red-dark)] disabled:cursor-not-allowed disabled:bg-[#b8b8bb]"
                                            >
                                                Aprovar e validar horas
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-[1.7rem] border border-dashed border-[var(--line-strong)] bg-white p-8 text-center text-[var(--muted)]">
                        Nenhum certificado recebido ate o momento.
                    </div>
                )}
            </section>
        </ProfessorLayout>
    );
}
