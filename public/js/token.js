import { apiPost } from './api.js';

/**
 * Récupère les informations de l'utilisateur stockées.
 * @returns {object} Le payload de l'utilisateur, ou null si l'utilisateur est déconnecté.
 */
export function getTokenPayload() {
  const user = sessionStorage.getItem('user');
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    sessionStorage.removeItem('user');
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
export async function logout() {
  try {
    await apiPost('/auth/logout');
  } catch (error) {
    console.error('Erreur lors de la déconnexion', error);
  }
  sessionStorage.removeItem('user');
  window.location.href = '/login.html';
}
