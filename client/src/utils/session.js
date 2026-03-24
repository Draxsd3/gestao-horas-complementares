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

export function getHomeRoute(role) {
    return role === 'PROFESSOR' ? '/professor' : '/dashboard';
}
