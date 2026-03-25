export function getStoredUser() {
    const usuarioJson = localStorage.getItem('usuario');

    if (!usuarioJson) {
        return null;
    }

    try {
        return JSON.parse(usuarioJson);
    } catch {
        localStorage.removeItem('usuario');
        return null;
    }
}

export function requiresPasswordChange(usuario) {
    return usuario?.role === 'ALUNO' && usuario?.precisaTrocarSenha;
}

export function getHomeRoute(roleOrUser) {
    if (typeof roleOrUser === 'object' && requiresPasswordChange(roleOrUser)) {
        return '/primeiro-acesso';
    }

    const role = typeof roleOrUser === 'string' ? roleOrUser : roleOrUser?.role;
    return role === 'PROFESSOR' ? '/professor' : '/dashboard';
}
