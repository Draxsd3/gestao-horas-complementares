import api from '../api/api';
import ProgressBar from '../components/ProgressBar';
import InstitutionalHeader from '../components/InstitutionalHeader';
import TransitionLoader from '../components/TransitionLoader';
import { useQuery } from '@tanstack/react-query';
import { Code2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GruposHoras() {
    const navigate = useNavigate();
    const [isTransitioning, setIsTransitioning] = useState(false);
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
        setIsTransitioning(true);
        setTimeout(() => {
            localStorage.removeItem('usuario');
            navigate('/');
        }, 450);
    };

    if (!usuario) {
        Promise.resolve().then(() => navigate('/'));
        return null;
    }

    if (isLoading) return <div className="mt-20 text-center text-[var(--brand-red)] animate-pulse">Carregando grupos...</div>;
    if (error) return <div className="mt-20 text-center text-[var(--brand-red)]">Erro ao carregar grupos.</div>;

    return (
        <div className="min-h-screen bg-[var(--page-bg)] pb-12">
            {isTransitioning ? <TransitionLoader label="Saindo..." /> : null}
            <InstitutionalHeader
                hideHeading
                navItems={[
                    { label: 'Home', onClick: () => navigate('/dashboard') },
                    { label: 'Grupos de horas', onClick: () => navigate('/grupos') },
                    { label: 'Perfil', onClick: () => navigate('/perfil') },
                ]}
                actionItems={[
                    { label: 'Novo certificado', onClick: () => navigate('/enviar') },
                    { label: 'Sair', onClick: handleLogout },
                ]}
            />

            <main className="mx-auto max-w-7xl space-y-8 px-4 pt-8 md:px-6 lg:px-8">
                <section>
                    <div className="mb-8">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-red)]">
                            Grupos de horas
                        </p>
                        <h1 className="mt-2 text-2xl font-bold text-[var(--ink)]">
                            Grupos de horas complementares
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
                            Acompanhe o progresso de cada categoria validada para o seu curso.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6">
                        {grupos?.map((grupo) => (
                            <ProgressBar
                                key={grupo.id}
                                tema={grupo.descricao}
                                atual={grupo.horasAprovadas}
                                maximo={grupo.horasMaximas}
                                Icon={Code2}
                                numero={grupo.numero}
                            />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
