import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AppFooter from './AppFooter';
import InstitutionalHeader from './InstitutionalHeader';
import TransitionLoader from './TransitionLoader';
import { getHomeRoute, getStoredUser } from '../utils/session';

export default function ProfessorLayout({
    title,
    subtitle,
    children,
    actionItems = [],
    contentClassName = 'mx-auto w-full max-w-7xl flex-1 space-y-8 px-4 pb-16 pt-8 md:px-6 lg:px-8'
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
        return <Navigate to="/" replace />;
    }

    if (usuario.role !== 'PROFESSOR') {
        return <Navigate to={getHomeRoute(usuario.role)} replace />;
    }

    const headerActionItems = [
        ...(Array.isArray(actionItems) ? actionItems : []),
        { label: 'Sair', onClick: handleLogout },
    ];
    const headerNavItems = [
        { label: 'Painel', onClick: () => navigate('/professor') },
        { label: 'Desempenho', onClick: () => navigate('/professor/alunos/listagem') },
        { label: 'Alunos', onClick: () => navigate('/professor/alunos') },
        { label: 'Certificados', onClick: () => navigate('/professor/certificados') },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-[var(--page-bg)]">
            {isTransitioning ? <TransitionLoader label="Saindo..." /> : null}

            <InstitutionalHeader
                title={title}
                subtitle={subtitle}
                hideHeading
                navItems={headerNavItems}
                actionItems={headerActionItems}
            />

            <main className={contentClassName}>
                {children}
            </main>

            <AppFooter />
        </div>
    );
}
