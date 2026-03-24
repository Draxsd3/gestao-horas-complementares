import api from '../api/api';
import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import TransitionLoader from '../components/TransitionLoader';
import etecRegistro from '../assets/etec_registro.png';
import logoGovernoSP from '../assets/logo-governo-do-estado-sp.png';
import { getHomeRoute } from '../utils/session';

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const preloadUserData = (usuario) => {
        if (usuario.role === 'PROFESSOR') {
            queryClient.prefetchQuery({
                queryKey: ['professor-dashboard', usuario.id],
                queryFn: async () => {
                    const response = await api.get(`/professor/dashboard/${usuario.id}`);
                    return response.data;
                }
            });
            return;
        }

        queryClient.prefetchQuery({
            queryKey: ['grupos-progresso', usuario.id],
            queryFn: async () => {
                const response = await api.get(`/grupos-progresso/${usuario.id}`);
                return response.data;
            }
        });

        queryClient.prefetchQuery({
            queryKey: ['certificados-resumo', usuario.id],
            queryFn: async () => {
                const response = await api.get(`/certificados-resumo/${usuario.id}`);
                return response.data;
            }
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const normalizedEmail = email.trim();
        const normalizedSenha = senha.trim();

        if (!normalizedEmail || !normalizedSenha) {
            setErrorMessage('Informe e-mail e senha para acessar.');
            return;
        }

        try {
            setErrorMessage('');
            setIsTransitioning(true);
            const response = await api.post('/login', {
                email: normalizedEmail,
                senha: normalizedSenha
            });

            localStorage.setItem('usuario', JSON.stringify(response.data));
            preloadUserData(response.data);
            navigate(getHomeRoute(response.data.role), { replace: true });
        } catch (error) {
            setIsTransitioning(false);
            setErrorMessage(error.response?.data?.error || 'Erro ao realizar login.');
        }
    };

    return (
        <div className="relative min-h-screen bg-[var(--page-bg)]">
            {isTransitioning ? <TransitionLoader label="Entrando..." /> : null}

            <div className="absolute left-4 top-4 rounded-[1.2rem] bg-black px-4 py-3 shadow-[0_18px_38px_rgba(0,0,0,0.18)]">
                <img
                    src={logoGovernoSP}
                    alt="Logo do Governo do Estado de Sao Paulo"
                    className="h-10 w-auto object-contain md:h-12"
                />
            </div>

            <main className="flex min-h-screen w-full items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <form
                        onSubmit={handleLogin}
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
                            <h1 className="text-3xl font-bold text-[var(--ink)]">Entrar</h1>
                            <p className="mt-2 text-sm text-[var(--muted)]">
                                Acesse o painel de aluno ou professor com seu e-mail e senha.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                                <input
                                    type="email"
                                    placeholder="E-mail"
                                    className="h-14 w-full rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] py-2 pl-12 pr-4 text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand-red)]"
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    value={email}
                                    autoComplete="username"
                                    disabled={isTransitioning}
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                                <input
                                    type="password"
                                    placeholder="Senha"
                                    className="h-14 w-full rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] py-2 pl-12 pr-4 text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand-red)]"
                                    onChange={(e) => {
                                        setSenha(e.target.value);
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    value={senha}
                                    autoComplete="current-password"
                                    disabled={isTransitioning}
                                />
                            </div>

                            {errorMessage ? (
                                <div className="rounded-2xl border border-[var(--brand-red)] bg-[var(--brand-red-soft)] px-4 py-3 text-sm font-medium text-[var(--brand-red)]">
                                    {errorMessage}
                                </div>
                            ) : null}

                            <button
                                type="submit"
                                disabled={isTransitioning}
                                className="mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-[var(--brand-red)] font-bold text-white transition-colors hover:bg-[var(--brand-red-dark)] disabled:cursor-not-allowed disabled:bg-[#b8b8bb]"
                            >
                                {isTransitioning ? 'Entrando...' : 'Entrar'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
