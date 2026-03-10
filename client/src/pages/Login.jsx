import api from '../api/api';
import { useState } from 'react';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/login', { email, senha });
            alert(`Bem-vindo, ${response.data.nome}`);
            localStorage.setItem('usuario', JSON.stringify(response.data));
            navigate('/dashboard');
        } catch (error) {
            alert('Erro ao logar: ' + (error.response?.data?.error || 'Erro interno'));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-xl shadow-2xl w-96 border border-slate-800">
                <div className="flex justify-center mb-6">
                    <LogIn size={48} className="text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-6">Horas Tech - Login</h2>

                <div className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
                        <input
                            type="email"
                            placeholder="E-mail"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
                        <input
                            type="password"
                            placeholder="Senha"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500"
                            onChange={(e) => setSenha(e.target.value)}
                        />
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors">
                        Entrar
                    </button>
                </div>
            </form>
        </div>
    );
};