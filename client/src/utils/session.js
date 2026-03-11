export function getStoredUser() {
    const usuarioJson = localStorage.getItem('usuario');
    return usuarioJson ? JSON.parse(usuarioJson) : null;
}

export function getHomeRoute(role) {
    return role === 'PROFESSOR' ? '/professor' : '/dashboard';
}
