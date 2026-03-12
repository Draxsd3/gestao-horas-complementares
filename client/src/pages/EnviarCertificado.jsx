import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';
import AppFooter from '../components/AppFooter';
import { Navigate, useNavigate } from 'react-router-dom';
import { Upload, Send, FileUp, BadgeCheck } from 'lucide-react';
import InstitutionalHeader from '../components/InstitutionalHeader';
import TransitionLoader from '../components/TransitionLoader';
import { getHomeRoute, getStoredUser } from '../utils/session';

export default function EnviarCertificado() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const usuario = getStoredUser();
    const [isTransitioning, setIsTransitioning] = useState(false);

    const [titulo, setTitulo] = useState('');
    const [horas, setHoras] = useState('');
    const [grupoId, setGrupoId] = useState('');
    const [arquivo, setArquivo] = useState(null);

    const { data: grupos } = useQuery({
        queryKey: ['grupos'],
        queryFn: () => api.get('/grupos').then(res => res.data)
    });

    const mutation = useMutation({
        mutationFn: (formData) => api.post('/enviar-certificado', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['grupos-progresso']);
            alert('Certificado enviado com sucesso! Agora e so aguardar a aprovacao.');
            navigate('/dashboard');
        },
        onError: (err) => alert('Erro no envio: ' + err.response?.data?.error)
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('horas', horas);
        formData.append('alunoId', usuario.id);
        formData.append('grupoId', grupoId);
        formData.append('arquivo', arquivo);

        mutation.mutate(formData);
    };

    const handleLogout = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            localStorage.removeItem('usuario');
            navigate('/');
        }, 450);
    };

    if (!usuario) {
        return <Navigate to="/" replace />;
    }

    if (usuario.role !== 'ALUNO') {
        return <Navigate to={getHomeRoute(usuario.role)} replace />;
    }

    return (
        <div className="flex min-h-screen flex-col bg-[var(--page-bg)]">
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

            <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-8 md:px-6 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-[0.95fr_1.15fr]">
                    <section className="rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,#4b545f_0%,#343b44_100%)] p-8 text-white shadow-[0_28px_60px_rgba(36,42,50,0.24)]">
                        <span className="inline-flex text-xs font-semibold uppercase tracking-[0.28em] text-[#ffd7dc]">
                            Orientacoes
                        </span>
                        <h2 className="mt-5 text-3xl font-bold leading-tight">
                            Prepare o envio com os dados principais da atividade.
                        </h2>
                        <div className="mt-8 space-y-4">
                            <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
                                <FileUp className="mb-3 text-[#ffb4bc]" size={24} />
                                <h3 className="font-bold">Arquivo legivel</h3>
                                <p className="mt-2 text-sm leading-6 text-[#d8dde3]">
                                    Envie PDF ou imagem com titulo, instituicao e carga horaria visiveis.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
                                <BadgeCheck className="mb-3 text-[#ffb4bc]" size={24} />
                                <h3 className="font-bold">Grupo correto</h3>
                                <p className="mt-2 text-sm leading-6 text-[#d8dde3]">
                                    Selecione o grupo que melhor representa a atividade para facilitar a analise.
                                </p>
                            </div>
                        </div>
                    </section>

                    <form
                        onSubmit={handleSubmit}
                        className="rounded-[2rem] border border-[var(--line)] bg-white p-8 shadow-[0_28px_60px_rgba(41,47,56,0.12)]"
                    >
                        <h2 className="mb-2 flex items-center gap-3 text-2xl font-bold text-[var(--ink)]">
                            <Upload className="text-[var(--brand-red)]" /> Novo certificado
                        </h2>
                        <p className="mb-8 text-sm text-[var(--muted)]">
                            Os dados enviados ficam vinculados ao seu usuario para avaliacao posterior.
                        </p>

                        <div className="space-y-5">
                            <input
                                type="text"
                                placeholder="Nome da atividade"
                                required
                                className="h-14 w-full rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] px-4 text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand-red)]"
                                onChange={e => setTitulo(e.target.value)}
                            />

                            <div className="grid gap-4 md:grid-cols-2">
                                <input
                                    type="number"
                                    placeholder="Horas"
                                    required
                                    className="h-14 w-full rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] px-4 text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand-red)]"
                                    onChange={e => setHoras(e.target.value)}
                                />
                                <select
                                    required
                                    className="h-14 w-full rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] px-4 text-[var(--ink)] outline-none transition-colors focus:border-[var(--brand-red)]"
                                    onChange={e => setGrupoId(e.target.value)}
                                >
                                    <option value="">Selecione o grupo</option>
                                    {grupos?.map(g => (
                                        <option key={g.id} value={g.id}>{g.numero} - {g.descricao}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="rounded-[1.75rem] border-2 border-dashed border-[var(--line-strong)] bg-[var(--panel-soft)] p-6 transition-colors hover:border-[var(--brand-red)]">
                                <label className="flex cursor-pointer flex-col gap-3 text-sm text-[var(--muted)]">
                                    <span className="font-semibold text-[var(--ink)]">Arquivo do comprovante</span>
                                    <span>Formatos aceitos: imagem ou PDF.</span>
                                    <input
                                        type="file"
                                        required
                                        accept="image/*,.pdf"
                                        className="w-full text-sm text-[var(--muted)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--brand-red)] file:px-4 file:py-2 file:font-semibold file:text-white"
                                        onChange={e => setArquivo(e.target.files[0])}
                                    />
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="mt-8 flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[var(--brand-red)] font-bold text-white transition-colors hover:bg-[var(--brand-red-dark)] disabled:cursor-not-allowed disabled:bg-[#b8b8bb]"
                        >
                            {mutation.isPending ? 'Enviando...' : <><Send size={18} /> Enviar certificado</>}
                        </button>
                    </form>
                </div>
            </main>

            <AppFooter />
        </div>
    );
}
