export default function ProgressBar(props) {
    const { tema, atual, maximo, Icon, numero } = props;

    const porcentagem = Math.min((atual * 100) / maximo, 100);
    const concluido = porcentagem >= 100;
    const corBarra = concluido
        ? 'linear-gradient(90deg, #3c9b5f 0%, #6dc98d 100%)'
        : 'linear-gradient(90deg, #ce1126 0%, #f04b58 100%)';

    return (
        <article className="w-full max-w-[380px] rounded-[1.9rem] border border-[var(--line)] bg-white p-6 shadow-[0_20px_45px_rgba(44,52,61,0.08)]">
            <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[1.2rem] bg-[var(--brand-red-soft)] text-[var(--brand-red)]">
                        <Icon size={22} />
                    </div>
                    <div>
                        <span className="inline-flex rounded-full bg-[#eef1f4] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
                            Grupo {numero}
                        </span>
                        <h3 className="mt-3 text-base font-bold leading-6 text-[var(--ink)]">{tema}</h3>
                    </div>
                </div>

                <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                    {atual}/{maximo}h
                </span>
            </div>

            <div className="relative mb-4 h-3 w-full overflow-hidden rounded-full bg-[#e4e8ec]">
                <div
                    className="h-full transition-all duration-500 ease-out"
                    style={{ width: `${porcentagem}%`, background: corBarra }}
                />
            </div>

            <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--muted)]">
                    {concluido ? 'Carga concluida' : 'Aproveitamento registrado'}
                </span>
                <strong className={concluido ? 'text-[#2f8f57]' : 'text-[var(--ink)]'}>
                    {Math.round(porcentagem)}%
                </strong>
            </div>
        </article>
    );
}
