import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Camera, Clock3, FileCheck2, IdCard, UserRound, UsersRound } from 'lucide-react';
import api from '../api/api';
import ProfessorLayout from '../components/ProfessorLayout';
import TransitionLoader from '../components/TransitionLoader';
import { getStoredUser } from '../utils/session';

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

function SummaryCard({ icon, label, value }) {
    const Icon = icon;

    return (
        <div className="rounded-[1.3rem] bg-white/8 p-5 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-[#ffd7dc]">
                <Icon size={20} />
            </div>
            <strong className="mt-4 block text-3xl font-bold">{value}</strong>
            <span className="mt-2 block text-sm text-[#d4d9de]">{label}</span>
        </div>
    );
}

export default function ProfessorProfile() {
    const usuario = getStoredUser();
    const fileInputRef = useRef(null);
    const imageStorageKey = useMemo(() => usuario ? `usuario-imagem-${usuario.id}` : null, [usuario]);
    const [profileImage, setProfileImage] = useState(() => {
        if (!imageStorageKey) return '';
        return localStorage.getItem(imageStorageKey) || '';
    });

    const { data: dashboard, isLoading, error } = useQuery({
        queryKey: ['professor-dashboard', usuario?.id],
        queryFn: async () => {
            const response = await api.get(`/professor/dashboard/${usuario.id}`);
            return response.data;
        },
        enabled: !!usuario?.id && usuario?.role === 'PROFESSOR'
    });

    const handleProfileImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file || !imageStorageKey) {
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            setProfileImage(result);
            localStorage.setItem(imageStorageKey, result);
        };
        reader.readAsDataURL(file);
    };

    if (isLoading) {
        return <TransitionLoader label="Carregando perfil do professor..." />;
    }

    if (error) {
        return <div className="mt-20 text-center text-[var(--brand-red)]">Erro ao carregar o perfil do professor.</div>;
    }

    return (
        <ProfessorLayout
            title="Meu perfil"
            subtitle="Consulte seus dados de acesso e o resumo operacional da sua area."
        >
            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#4a525d_0%,#2b3138_100%)] p-8 text-white shadow-[0_28px_65px_rgba(34,40,48,0.24)]">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="group relative flex h-[4.5rem] w-[4.5rem] items-center justify-center overflow-hidden rounded-[1.5rem] bg-white/12 text-[#ffd7dc]"
                        >
                            {profileImage ? (
                                <img src={profileImage} alt="Imagem de perfil do professor" className="h-full w-full object-cover" />
                            ) : (
                                <UserRound size={34} />
                            )}
                            <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/35 text-white opacity-0 transition-opacity group-hover:opacity-100">
                                <Camera size={12} />
                            </span>
                        </button>
                        <div>
                            <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#ffd7dc]">
                                Meu perfil
                            </p>
                            <h1 className="text-3xl font-bold">{usuario?.nome || 'Professor'}</h1>
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
                        Este painel centraliza seus dados de acesso e um resumo do acompanhamento
                        da turma, para deixar a navegacao do professor mais completa e consistente.
                    </p>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <SummaryCard icon={UsersRound} label="Alunos vinculados" value={dashboard?.totalAlunos || 0} />
                        <SummaryCard icon={Clock3} label="Pendentes" value={dashboard?.certificadosPendentes || 0} />
                        <SummaryCard icon={FileCheck2} label="Horas validadas" value={`${dashboard?.horasValidadas || 0}h`} />
                    </div>
                </div>

                <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_20px_40px_rgba(44,52,61,0.08)]">
                    <h2 className="text-2xl font-bold text-[var(--ink)]">Dados da conta</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                        Informacoes disponiveis para esta sessao de professor.
                    </p>

                    <div className="mt-6 space-y-3">
                        <InfoCard icon={UserRound} label="Nome" value={usuario?.nome || 'Nao informado'} />
                        <InfoCard icon={IdCard} label="Acesso" value={usuario?.email || 'E-mail nao informado na sessao'} />
                        <InfoCard icon={IdCard} label="Perfil" value="Professor" />
                    </div>

                    <div className="mt-4 rounded-[1.25rem] bg-[var(--panel-soft)] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                            Resumo de operacao
                        </p>
                        <strong className="mt-1 block text-[1.35rem] font-bold text-[var(--ink)]">
                            {dashboard?.certificadosAprovados || 0} aprovados / {dashboard?.certificadosRejeitados || 0} rejeitados
                        </strong>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                            Totais consolidados da sua fila de analise no momento.
                        </p>
                    </div>
                </div>
            </section>
        </ProfessorLayout>
    );
}
