import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { Upload, ChevronLeft, Send } from 'lucide-react';

export default function EnviarCertificado() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    const [titulo, setTitulo] = useState('');
    const [horas, setHoras] = useState('');
    const [grupoId, setGrupoId] = useState('');
    const [arquivo, setArquivo] = useState(null);

    // Buscamos os temas (grupos) para o aluno escolher no select
    const { data: grupos } = useQuery({
        queryKey: ['grupos'],
        queryFn: () => api.get('/grupos').then(res => res.data)
    });

    // Mutação para enviar o arquivo
    const mutation = useMutation({
        mutationFn: (formData) => api.post('/enviar-certificado', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        onSuccess: () => {
            // "Limpa" o cache do Dashboard para ele buscar as novas horas
            queryClient.invalidateQueries(['grupos-progresso']);
            alert('Certificado enviado com sucesso! Agora é só aguardar a aprovação.');
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

    return (
        <div className="min-h-screen bg-slate-950 p-6 text-white">
            <div className="max-w-xl mx-auto">
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors cursor-pointer">
                    <ChevronLeft size={20} /> Voltar ao Painel
                </button>

                <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Upload className="text-blue-500" /> Novo Certificado
                    </h2>

                    <div className="space-y-4">
                        <input 
                            type="text" placeholder="Nome da Atividade (ex: Curso React)" required
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 outline-none focus:border-blue-500"
                            onChange={e => setTitulo(e.target.value)}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <input 
                                type="number" placeholder="Horas" required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 outline-none focus:border-blue-500"
                                onChange={e => setHoras(e.target.value)}
                            />
                            <select 
                                required className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 outline-none focus:border-blue-500 text-slate-400"
                                onChange={e => setGrupoId(e.target.value)}
                            >
                                <option value="">Tema...</option>
                                {grupos?.map(g => (
                                    <option key={g.id} value={g.id}>{g.numero} - {g.descricao}</option>
                                ))}
                            </select>
                        </div>

                        <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                            <input 
                                type="file" required accept="image/*,.pdf" 
                                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white cursor-pointer"
                                onChange={e => setArquivo(e.target.files[0])}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={mutation.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 font-bold py-3 rounded-lg flex justify-center items-center gap-2 cursor-pointer transition-all"
                    >
                        {mutation.isPending ? "Enviando..." : <><Send size={18} /> Enviar Certificado</>}
                    </button>
                </form>
            </div>
        </div>
    );
}