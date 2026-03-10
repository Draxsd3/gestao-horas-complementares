export default function ProgressBar(props) {
    const { tema, atual, maximo, Icon } = props; // adicionei essa linha devido a um erro que estava dando no Icon quando o passavamos diretamente como parametro dentro da nossa Function ProgressBar()

    const porcentagem = Math.min((atual * 100) / maximo, 100);
    const corBarra = porcentagem >= 100 ? 'bg-green-500' : 'bg-blue-500';

    return (
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg text-blue-400">
                        <Icon size={20} />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200">{tema}</h3>
                </div>
                <span className="text-xs font-mono text-slate-400">{atual}/{maximo}h</span>
            </div>

            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ease-out ${corBarra}`}
                    style={{ width: `${porcentagem}%` }}
                ></div>
            </div>
        </div>
    );
}