/**
 * Décode le payload d'un JWT stocké dans sessionStorage.
 * @returns {object} Le payload décodé, ou null si le token est absent/invalide.
 */
export function getTokenPayload() {
  const token = sessionStorage.getItem('token');
  if (!token) return null;
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(b64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(json);
  } catch {
    sessionStorage.removeItem('token');
    return null;
  }
}

/**
 * Vérifie que l'utilisateur connecté est admin.
 * Redirige vers /login.html ou / si ce n'est pas le cas.
 * @returns {object|null} Le payload si admin, null sinon (avec redirection déjà effectuée).
 */
export function requireAdmin() {
  const payload = getTokenPayload();
  if (!payload) { window.location.href = '/login.html'; return null; }
  if (payload.role !== 'admin') { window.location.href = '/'; return null; }
  return payload;
}

/**
 * Déconnecte l'utilisateur et redirige vers la page de login.
 */
export function logout() {
  sessionStorage.removeItem('token');
  window.location.href = '/login.html';
}
