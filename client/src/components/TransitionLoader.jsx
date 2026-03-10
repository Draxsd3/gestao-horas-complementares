export default function TransitionLoader({ label = 'Carregando' }) {
    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-white">
            <div className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-[rgba(206,17,38,0.12)] blur-3xl" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#d9dde2] border-t-[var(--brand-red)]" />
                    <span className="text-sm font-semibold tracking-[0.12em] text-[var(--ink)]">{label}</span>
                </div>
            </div>
        </div>
    );
}
