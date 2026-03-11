import api from '../api/api';
import ProgressBar from '../components/ProgressBar';
import InstitutionalHeader from '../components/InstitutionalHeader';
import TransitionLoader from '../components/TransitionLoader';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Code2, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHomeRoute, getStoredUser } from '../utils/session';

export default function GruposHoras() {
    const navigate = useNavigate();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const usuario = getStoredUser();

    const { data: grupos, isLoading, error } = useQuery({
        queryKey: ['grupos-progresso', usuario?.id],
        queryFn: async () => {
            const res = await api.get(`/grupos-progresso/${usuario.id}`);
            return res.data;
        },
        enabled: !!usuario?.id && usuario?.role === 'ALUNO'
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

    if (usuario.role !== 'ALUNO') {
        Promise.resolve().then(() => navigate(getHomeRoute(usuario.role)));
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
                        <div className="mt-5 inline-flex rounded-[1.6rem] border border-[var(--line)] bg-white p-2 shadow-[0_14px_28px_rgba(44,52,61,0.06)] md:hidden">
                            <button
                                type="button"
                                onClick={() => navigate('/perfil')}
                                className="inline-flex items-center gap-2 rounded-[1.1rem] bg-[var(--brand-red)] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-red-dark)]"
                            >
                                <UserRound size={16} /> Ir para perfil <ArrowRight size={15} />
                            </button>
                        </div>
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
