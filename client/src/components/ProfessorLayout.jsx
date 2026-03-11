import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InstitutionalHeader from './InstitutionalHeader';
import TransitionLoader from './TransitionLoader';
import { getHomeRoute, getStoredUser } from '../utils/session';

export default function ProfessorLayout({
    title,
    subtitle,
    children,
    actionItems = []
}) {
    const navigate = useNavigate();
    const usuario = getStoredUser();
    const [isTransitioning, setIsTransitioning] = useState(false);

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

    if (usuario.role !== 'PROFESSOR') {
        Promise.resolve().then(() => navigate(getHomeRoute(usuario.role)));
        return null;
    }

    return (
        <div className="min-h-screen bg-[var(--page-bg)] pb-12">
            {isTransitioning ? <TransitionLoader label="Saindo..." /> : null}

            <InstitutionalHeader
                title={title}
                subtitle={subtitle}
                navItems={[
                    { label: 'Painel', onClick: () => navigate('/professor') },
                    { label: 'Alunos', onClick: () => navigate('/professor/alunos') },
                    { label: 'Certificados', onClick: () => navigate('/professor/certificados') },
                ]}
                actionItems={[
                    ...actionItems,
                    { label: 'Sair', onClick: handleLogout },
                ]}
            />

            <main className="mx-auto max-w-7xl space-y-8 px-4 pt-8 md:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
