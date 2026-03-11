import api from '../api/api';
import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TransitionLoader from '../components/TransitionLoader';
import etecRegistro from '../assets/etec_registro.png';
import logoGovernoSP from '../assets/logo-governo-do-estado-sp.png';
import { getHomeRoute } from '../utils/session';

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setIsTransitioning(true);
            const response = await api.post('/login', { email, senha });
            localStorage.setItem('usuario', JSON.stringify(response.data));
            setTimeout(() => navigate(getHomeRoute(response.data.role)), 450);
        } catch (error) {
            setIsTransitioning(false);
            alert('Erro ao logar: ' + (error.response?.data?.error || 'Erro interno'));
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
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                                <input
                                    type="password"
                                    placeholder="Senha"
                                    className="h-14 w-full rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] py-2 pl-12 pr-4 text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand-red)]"
                                    onChange={(e) => setSenha(e.target.value)}
                                    value={senha}
                                />
                            </div>

                            <button
                                type="submit"
                                className="mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-[var(--brand-red)] font-bold text-white transition-colors hover:bg-[var(--brand-red-dark)]"
                            >
                                Entrar
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
