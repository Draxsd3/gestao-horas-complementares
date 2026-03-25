import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Lock, ShieldCheck } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../api/api';
import TransitionLoader from '../components/TransitionLoader';
import etecRegistro from '../assets/etec_registro.png';
import logoGovernoSP from '../assets/logo-governo-do-estado-sp.png';
import { getHomeRoute, getStoredUser, requiresPasswordChange } from '../utils/session';

export default function FirstAccessPassword() {
    const navigate = useNavigate();
    const usuario = getStoredUser();
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const alterarSenhaMutation = useMutation({
        mutationFn: (payload) => api.patch(`/alunos/${usuario.id}/primeiro-acesso`, payload),
        onSuccess: (response) => {
            localStorage.setItem('usuario', JSON.stringify(response.data));
            navigate(getHomeRoute(response.data), { replace: true });
        },
        onError: (errorResponse) => {
            setErrorMessage(errorResponse.response?.data?.error || 'Nao foi possivel atualizar a senha.');
        }
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        const normalizedPassword = novaSenha.trim();
        const normalizedConfirmation = confirmacaoSenha.trim();

        if (!normalizedPassword || !normalizedConfirmation) {
            setErrorMessage('Preencha a nova senha e a confirmacao.');
            return;
        }

        if (normalizedPassword !== normalizedConfirmation) {
            setErrorMessage('A confirmacao de senha nao confere.');
            return;
        }

        setErrorMessage('');
        alterarSenhaMutation.mutate({ novaSenha: normalizedPassword });
    };

    if (!usuario) {
        return <Navigate to="/" replace />;
    }

    if (usuario.role !== 'ALUNO') {
        return <Navigate to={getHomeRoute(usuario)} replace />;
    }

    if (!requiresPasswordChange(usuario)) {
        return <Navigate to={getHomeRoute(usuario)} replace />;
    }

    return (
        <div className="relative min-h-screen bg-[var(--page-bg)]">
            {alterarSenhaMutation.isPending ? <TransitionLoader label="Atualizando senha..." /> : null}

            <div className="absolute left-4 top-4 rounded-[1.2rem] bg-black px-4 py-3 shadow-[0_18px_38px_rgba(0,0,0,0.18)]">
                <img
                    src={logoGovernoSP}
                    alt="Logo do Governo do Estado de Sao Paulo"
                    className="h-10 w-auto object-contain md:h-12"
                />
            </div>

            <main className="flex min-h-screen w-full items-center justify-center px-4">
                <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                    <section className="rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,#4b545f_0%,#343b44_100%)] p-8 text-white shadow-[0_28px_60px_rgba(36,42,50,0.24)]">
                        <span className="inline-flex text-xs font-semibold uppercase tracking-[0.28em] text-[#ffd7dc]">
                            Primeiro acesso
                        </span>
                        <h1 className="mt-5 text-3xl font-bold leading-tight">
                            Antes de continuar, defina sua senha pessoal.
                        </h1>
                        <div className="mt-8 space-y-4">
                            <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
                                <ShieldCheck className="mb-3 text-[#ffb4bc]" size={24} />
                                <h3 className="font-bold">Mais seguranca</h3>
                                <p className="mt-2 text-sm leading-6 text-[#d8dde3]">
                                    A senha padrao e apenas temporaria. Depois desta etapa, so voce conhecera a senha de acesso.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
                                <Lock className="mb-3 text-[#ffb4bc]" size={24} />
                                <h3 className="font-bold">Troca obrigatoria</h3>
                                <p className="mt-2 text-sm leading-6 text-[#d8dde3]">
                                    O sistema so libera o painel do aluno apos a definicao da nova senha.
                                </p>
                            </div>
                        </div>
                    </section>

                    <form
                        onSubmit={handleSubmit}
                        className="rounded-[2rem] border border-[var(--line)] bg-white p-8 shadow-[0_24px_60px_rgba(41,47,56,0.12)] md:p-10"
                    >
                        <div className="mb-8 flex justify-center">
                            <img
                                src={etecRegistro}
                                alt="Logo Etec Registro"
                                className="w-44 max-w-full object-contain"
                            />
                        </div>

                        <div className="mb-8 text-center">
                                <h2 className="text-3xl font-bold text-[var(--ink)]">Alterar senha</h2>
                                <p className="mt-2 text-sm text-[var(--muted)]">
                                Ola, {usuario.nome}. Use seu RM nas proximas entradas e crie agora sua nova senha pessoal.
                                </p>
                            </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                                <input
                                    type="password"
                                    placeholder="Nova senha"
                                    className="h-14 w-full rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] py-2 pl-12 pr-4 text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand-red)]"
                                    onChange={(event) => {
                                        setNovaSenha(event.target.value);
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    value={novaSenha}
                                    autoComplete="new-password"
                                    disabled={alterarSenhaMutation.isPending}
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                                <input
                                    type="password"
                                    placeholder="Confirmar nova senha"
                                    className="h-14 w-full rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] py-2 pl-12 pr-4 text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand-red)]"
                                    onChange={(event) => {
                                        setConfirmacaoSenha(event.target.value);
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    value={confirmacaoSenha}
                                    autoComplete="new-password"
                                    disabled={alterarSenhaMutation.isPending}
                                />
                            </div>

                            {errorMessage ? (
                                <div className="rounded-2xl border border-[var(--brand-red)] bg-[var(--brand-red-soft)] px-4 py-3 text-sm font-medium text-[var(--brand-red)]">
                                    {errorMessage}
                                </div>
                            ) : null}

                            <button
                                type="submit"
                                disabled={alterarSenhaMutation.isPending}
                                className="mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-[var(--brand-red)] font-bold text-white transition-colors hover:bg-[var(--brand-red-dark)] disabled:cursor-not-allowed disabled:bg-[#b8b8bb]"
                            >
                                {alterarSenhaMutation.isPending ? 'Salvando...' : 'Salvar nova senha'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
