import { useQuery } from '@tanstack/react-query';
import { ChartColumn, X } from 'lucide-react';
import api from '../api/api';

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

export default function ProfessorStudentPerformancePanel({
    alunoId,
    professorId,
    onClose,
    showCloseButton = true
}) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['professor-aluno-desempenho', professorId, alunoId],
        queryFn: async () => {
            const response = await api.get(`/professor/alunos/${professorId}/${alunoId}/desempenho`);
            return response.data;
        },
        enabled: !!alunoId && !!professorId
    });

    return (
        <section className="rounded-[1.8rem] border border-[var(--line)] bg-white p-6 shadow-[0_18px_35px_rgba(44,52,61,0.06)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-red)]">Desempenho individual</p>
                    <h2 className="mt-2 text-2xl font-bold text-[var(--ink)]">
                        {data?.aluno?.nome || 'Carregando aluno...'}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                        {data?.aluno?.rm ? `RM ${data.aluno.rm}` : 'Aguarde o carregamento dos dados.'}
                        {data?.aluno?.serie ? ` | ${data.aluno.serie}` : ''}
                    </p>
                </div>

                {showCloseButton ? (
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)]"
                    >
                        <X size={16} />
                        Fechar
                    </button>
                ) : null}
            </div>

            {isLoading ? (
                <div className="mt-6 rounded-[1.5rem] bg-[var(--panel-soft)] p-6 text-center text-[var(--muted)]">
                    Carregando desempenho do aluno...
                </div>
            ) : null}

            {error ? (
                <div className="mt-6 rounded-[1.5rem] border border-[var(--brand-red)] bg-[var(--brand-red-soft)] p-6 text-center text-[var(--brand-red)]">
                    Erro ao carregar desempenho do aluno.
                </div>
            ) : null}

            {!isLoading && !error && data ? (
                <>
                    <div className="mt-6 grid gap-4 md:grid-cols-4">
                        <SummaryBadge label="Progresso geral" value={`${data.resumo.percentualGeral}%`} />
                        <SummaryBadge label="Horas aprovadas" value={`${data.resumo.totalHorasAprovadas}h`} />
                        <SummaryBadge label="Grupos concluidos" value={data.resumo.gruposConcluidos} />
                        <SummaryBadge label="Pendencias" value={data.resumo.gruposPendentes} />
                    </div>

                    <div className="mt-6">
                        <div className="mb-4 flex items-center gap-3">
                            <ChartColumn className="text-[var(--brand-red)]" size={20} />
                            <h3 className="text-lg font-bold text-[var(--ink)]">Progresso por grupo</h3>
                        </div>
                        <div className="grid gap-4">
                            {data.grupos.map((grupo) => (
                                <ProgressGroupCard key={grupo.id} grupo={grupo} />
                            ))}
                        </div>
                    </div>
                </>
            ) : null}
        </section>
    );
}
