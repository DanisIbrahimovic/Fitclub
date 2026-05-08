import { apiPost, apiPut } from './api.js';
import { getTokenPayload, logout } from './token.js';

export const registerUser = (email, password, confirmPassword) =>
  apiPost('/auth/register', { email, password, confirmPassword });

export const loginUser = (email, password) =>
  apiPost('/auth/login', { email, password });

export const changePassword = (currentPassword, newPassword, confirmPassword) =>
  apiPut('/auth/password', { currentPassword, newPassword, confirmPassword });

/** Met à jour la barre de navigation selon l'état de connexion. */
export const updateNavbar = () => {
  const payload = getTokenPayload();
  if (!payload) return;

  const { email = '', role = 'user' } = payload;
  const username = email.split('@')[0];

  const authSection = document.querySelector('.auth-section');
  if (!authSection) return;

  authSection.innerHTML = '';

  // Bouton admin (si rôle == admin)
  if (role === 'admin') {
    const adminBtn = Object.assign(document.createElement('a'), {
      href: '/admin/activities.html',
      className: 'admin-btn',
      title: 'Espace Administrateur',
    });
    Object.assign(adminBtn.style, { display: 'inline-flex', alignItems: 'center', marginRight: '15px' });

    const adminIcon = Object.assign(document.createElement('img'), {
      src: '/assets/icons/shield-user.png',
      alt: 'Admin',
    });
    Object.assign(adminIcon.style, { height: '24px', verticalAlign: 'middle' });

    adminBtn.appendChild(adminIcon);
    authSection.appendChild(adminBtn);
  }

  // Menu utilisateur (dropdown)
  const userMenu = document.createElement('div');
  userMenu.className = 'user-menu';

  const userIconBtn = document.createElement('div');
  userIconBtn.className = 'user-icon-btn';
  const userIcon = Object.assign(document.createElement('img'), {
    src: '/assets/icons/user.png',
    alt: 'Utilisateur',
  });
  userIconBtn.appendChild(userIcon);

  const dropdownContent = document.createElement('div');
  dropdownContent.className = 'dropdown-content';

  const userInfo = Object.assign(document.createElement('div'), {
    className: 'user-info',
    textContent: `Bonjour, ${username}`,
  });

  const changePwdLink = Object.assign(document.createElement('a'), {
    href: '/change-password.html',
    textContent: 'Modifier le mot de passe',
  });

  const logoutLink = Object.assign(document.createElement('a'), {
    href: '#',
    textContent: 'Déconnexion',
  });
  logoutLink.style.color = 'var(--color-red)';
  logoutLink.addEventListener('click', (e) => { e.preventDefault(); logout(); });

  dropdownContent.append(userInfo, changePwdLink, logoutLink);
  userMenu.append(userIconBtn, dropdownContent);
  authSection.appendChild(userMenu);
};
