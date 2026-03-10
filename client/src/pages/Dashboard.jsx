import api from '../api/api';
import ProgressBar from '../components/ProgressBar';
import { useQuery } from '@tanstack/react-query'; // usar useQuery pq useEffect só da b.o
import { LayoutDashboard, Code, LogOut, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const navigate = useNavigate();

    const usuarioJson = localStorage.getItem('usuario');
    const usuario = usuarioJson ? JSON.parse(usuarioJson) : null;

    const { data: grupos, isLoading, error } = useQuery({
        queryKey: ['grupos-progresso', usuario?.id],
        queryFn: async () => {
            const res = await api.get(`/grupos-progresso/${usuario.id}`);
            return res.data;
        },
        enabled: !!usuario?.id
    });

    const handleLogout = () => {
        localStorage.removeItem('usuario');
        navigate('/');
    }

    if (!usuario) {
        Promise.resolve().then(() => navigate('/'));
        return null;
    }

    if (isLoading) return <div className="text-center mt-20 text-blue-500 animate-pulse">Carregando painel do Mestre...</div>;
    if (error) return <div className="text-center mt-20 text-red-500">Erro ao carregar dados.</div>;

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <header className="max-w-6xl mx-auto mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <LayoutDashboard className="text-blue-500" /> Painel de Horas
                    </h1>
                    <p className="text-slate-400">Olá, {usuario.nome}. Acompanhe seu progresso.</p>
                </div>


                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/enviar')}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all cursor-pointer font-bold shadow-lg shadow-blue-900/20"
                    >
                        <Plus size={18} /> Novo Certificado
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-red-900/20 text-slate-400 hover:text-red-500 px-4 py-2 rounded-lg transition-all border border-slate-800 cursor-pointer"
                    >
                        <LogOut size={18} /> Sair
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {grupos?.map((grupo) => (
                    <ProgressBar
                        key={grupo.id}
                        tema={grupo.descricao}
                        atual={grupo.horasAprovadas}
                        maximo={grupo.horasMaximas}
                        Icon={Code}
                    />
                ))}
            </main>
        </div>
    );
}