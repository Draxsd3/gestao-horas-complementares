import api from '../api/api';
import InstitutionalHeader from '../components/InstitutionalHeader';
import TransitionLoader from '../components/TransitionLoader';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRound, Mail, LogOut, Camera } from 'lucide-react';
import { getHomeRoute, getStoredUser } from '../utils/session';

function InfoCard({ icon, label, value }) {
    const Icon = icon;
    return (
        <div className="rounded-[1.25rem] bg-[linear-gradient(180deg,#ffffff_0%,#f8f9fb_100%)] p-4">
            <div className="mb-2 flex items-center gap-2 text-[var(--muted)]">
                <Icon size={15} />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</span>
            </div>
            <strong className="block text-base font-bold text-[var(--ink)]">{value}</strong>
        </div>
    );
}

export default function Perfil() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const usuario = getStoredUser();
    const imageStorageKey = useMemo(() => usuario ? `usuario-imagem-${usuario.id}` : null, [usuario]);
    const [profileImage, setProfileImage] = useState(() => {
        if (!imageStorageKey) return '';
        return localStorage.getItem(imageStorageKey) || '';
    });
    const [isTransitioning, setIsTransitioning] = useState(false);

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

    const handleProfileImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file || !imageStorageKey) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            setProfileImage(result);
            localStorage.setItem(imageStorageKey, result);
        };
        reader.readAsDataURL(file);
    };

    if (!usuario) {
        Promise.resolve().then(() => navigate('/'));
        return null;
    }

    if (usuario.role !== 'ALUNO') {
        Promise.resolve().then(() => navigate(getHomeRoute(usuario.role)));
        return null;
    }

    if (isLoading) return <div className="mt-20 text-center text-[var(--brand-red)] animate-pulse">Carregando perfil...</div>;
    if (error) return <div className="mt-20 text-center text-[var(--brand-red)]">Erro ao carregar perfil.</div>;

    const totalHoras = grupos?.reduce((soma, grupo) => soma + grupo.horasAprovadas, 0) || 0;
    const totalLimite = grupos?.reduce((soma, grupo) => soma + grupo.horasMaximas, 0) || 0;
    const percentualTotal = totalLimite ? Math.round((totalHoras * 100) / totalLimite) : 0;
    const gruposComHoras = grupos?.filter((grupo) => grupo.horasAprovadas > 0).length || 0;

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
                <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#4a525d_0%,#2b3138_100%)] p-8 text-white shadow-[0_28px_65px_rgba(34,40,48,0.24)]">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="group relative flex h-[4.5rem] w-[4.5rem] items-center justify-center overflow-hidden rounded-[1.5rem] bg-white/12 text-[#ffd7dc]"
                            >
                                {profileImage ? (
                                    <img src={profileImage} alt="Imagem de perfil do aluno" className="h-full w-full object-cover" />
                                ) : (
                                    <UserRound size={34} />
                                )}
                                <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/35 text-white opacity-0 transition-opacity group-hover:opacity-100">
                                    <Camera size={12} />
                                </span>
                            </button>
                            <div>
                                <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#ffd7dc]">
                                    Perfil do aluno
                                </p>
                                <h1 className="text-3xl font-bold">{usuario.nome}</h1>
                            </div>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleProfileImageChange}
                        />

                        <p className="mt-6 max-w-2xl text-sm leading-7 text-[#d4d9de]">
                            Este painel reune suas informacoes principais de acesso e um resumo do cumprimento
                            das horas complementares registradas no sistema.
                        </p>

                        <div className="mt-8 grid gap-4 md:grid-cols-3">
                            <div className="p-5 text-center">
                                <strong className="block text-3xl font-bold">{totalHoras}h</strong>
                                <span className="text-sm text-[#d4d9de]">Horas aprovadas</span>
                            </div>

                            <div className="p-5 text-center">
                                <strong className="block text-3xl font-bold">{gruposComHoras}</strong>
                                <span className="text-sm text-[#d4d9de]">Grupos com avanço</span>
                            </div>

                            <div className="p-5 text-center">
                                <strong className="block text-3xl font-bold">{percentualTotal}%</strong>
                                <span className="text-sm text-[#d4d9de]">Progresso total</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_20px_40px_rgba(44,52,61,0.08)]">
                        <h2 className="text-2xl font-bold text-[var(--ink)]">Dados da conta</h2>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                            Informacoes atualmente armazenadas para este acesso.
                        </p>

                        <div className="mt-6 space-y-3">
                            <InfoCard icon={UserRound} label="Nome" value={usuario.nome} />
                            <InfoCard icon={Mail} label="E-mail" value={usuario.email || 'Nao informado na sessao'} />
                        </div>

                        <div className="mt-4 rounded-[1.25rem] bg-[var(--panel-soft)] p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                                Capacidade total configurada
                            </p>
                            <strong className="mt-1 block text-[1.35rem] font-bold text-[var(--ink)]">{totalLimite}h</strong>
                            <p className="mt-1 text-sm text-[var(--muted)]">
                                Meta acumulada para todas as categorias de horas complementares.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="mt-6 flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--line-strong)] px-5 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)]"
                        >
                            <LogOut size={18} /> Encerrar sessao
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}
