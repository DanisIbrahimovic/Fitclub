import { apiGet, apiPost } from './api.js';
import { updateNavbar } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();

  const daysContainer    = document.getElementById('date-selector');
  const coursesContainer = document.getElementById('schedule-grid');
  const messageContainer = document.getElementById('schedule-message');
  const filterSelect     = document.getElementById('filter-activity');

  let allCourses      = [];
  let nextDays        = [];
  let selectedDate    = '';
  let selectedActivity = '';

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Formate une date en string locale YYYY-MM-DD (sans conversion UTC). */
  const toLocalDateString = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const showMessage = (msg, isError = false) => {
    if (!messageContainer) { alert(msg); return; }
    Object.assign(messageContainer, { textContent: msg, className: isError ? 'error-message' : 'success-message' });
    Object.assign(messageContainer.style, {
      display: 'block', padding: '10px', marginBottom: '15px', borderRadius: '4px',
      backgroundColor: isError ? '#ffebee' : '#e8f5e9',
      color: isError ? 'var(--color-red)' : '#2e7d32',
    });
    setTimeout(() => { messageContainer.style.display = 'none'; }, 5000);
  };

  // ─── Jours ────────────────────────────────────────────────────────────────

  const initDays = () => {
    const today = new Date();
    for (let i = 0; i < 8; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i + 1);

      let dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
      dayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      const dayDate = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      if (i === 0) dayName = 'Dem.';

      nextDays.push({ id: toLocalDateString(date), dayName, dayDate, date });
    }
    selectedDate = nextDays[0].id;
  };

  const renderDays = () => {
    if (!daysContainer) return;
    daysContainer.innerHTML = nextDays.map(day => `
      <button class="date-btn ${day.id === selectedDate ? 'active' : ''}" data-date="${day.id}">
        <span class="day-name" style="pointer-events:none;">${day.dayName}</span>
        <span class="day-date" style="pointer-events:none;">${day.dayDate}</span>
      </button>
    `).join('');

    daysContainer.querySelectorAll('.date-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        selectedDate = e.target.dataset.date;
        renderDays();
        renderCourses();
      });
    });
  };

  // ─── Cours ────────────────────────────────────────────────────────────────

  const loadCourses = async () => {
    try {
      const response = await apiGet('/courses');
      allCourses = response?.data ?? [];
      populateActivityFilter();
      renderCourses();
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
      if (coursesContainer) {
        coursesContainer.innerHTML = '<div class="error-message">Impossible de charger le planning pour le moment.</div>';
      }
    }
  };

  const populateActivityFilter = () => {
    if (!filterSelect) return;
    const titles = [...new Set(allCourses.map(c => c.activityTitle).filter(Boolean))].sort();
    filterSelect.innerHTML = '<option value="">Toutes les activités</option>';
    titles.forEach(title => {
      filterSelect.innerHTML += `<option value="${title}" ${selectedActivity === title ? 'selected' : ''}>${title}</option>`;
    });
  };

  const renderCourses = () => {
    if (!coursesContainer) return;

    const dailyCourses = allCourses.filter(course => {
      if (selectedActivity && course.activityTitle !== selectedActivity) return false;
      const ts = course.datetime;
      if (!ts) return false;
      return toLocalDateString(new Date(ts)) === selectedDate;
    });

    if (dailyCourses.length === 0) {
      coursesContainer.innerHTML = `
        <div class="no-results" style="text-align:center;padding:2rem;">
          <h3>Aucun cours prévu</h3>
          <p>Il n'y a pas de cours programmé pour cette journée.</p>
        </div>`;
      return;
    }

    coursesContainer.innerHTML = dailyCourses.map(course => {
      const startDate   = new Date(course.datetime);
      const timeString  = startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const capacity    = course.nbplaces ?? 0;
      const booked      = course.booked_count ?? 0;
      const isFull      = capacity > 0 && booked >= capacity;
      const placesText  = isFull ? 'Complet' : `${booked}/${capacity} places`;

      const btnHtml = isFull
        ? `<button class="btn-primary disabled" disabled style="background:#999;cursor:not-allowed;">Complet</button>`
        : `<button class="btn-primary btn-reserve" data-id="${course.id}">Réserver</button>`;

      return `
        <article class="course-card">
          <div class="course-time">${timeString}</div>
          <div class="course-details">
            <h3>${course.activityTitle || 'Cours'} <span class="badge-type">${course.activityType || 'Général'}</span></h3>
            <p class="course-room">📍 ${course.roomName || 'Non définie'}</p>
            <p style="font-size:0.85rem;color:#666;margin-top:5px;">
              <strong>Objectif:</strong> ${course.objective || 'Non défini'} |
              <strong>Durée:</strong> ${course.duration || '--'} min |
              <strong>Calories:</strong> ~${course.calories || '--'} kcal |
              <strong>Intensité:</strong> ${course.intensity || '--'}/5
            </p>
          </div>
          <div class="course-booking">
            <span class="places-left ${isFull ? 'places-none' : ''}">${placesText}</span>
            ${btnHtml}
          </div>
        </article>`;
    }).join('');

    coursesContainer.querySelectorAll('.btn-reserve').forEach(btn => {
      btn.addEventListener('click', (e) => handleReservation(e.target.dataset.id, btn));
    });
  };

  const handleReservation = async (classId, btn) => {
    if (!sessionStorage.getItem('user')) {
      window.location.href = '/login.html?redirect=/planning.html';
      return;
    }

    btn.disabled     = true;
    btn.textContent  = 'Réservation...';

    try {
      await apiPost('/courses/book', { classId: parseInt(classId, 10) });
      showMessage('Réservation confirmée pour ce cours !', false);
      await loadCourses();
    } catch (error) {
      console.error('Erreur de réservation:', error);
      showMessage(error.message || 'Impossible de réserver ce cours.', true);
      btn.disabled    = false;
      btn.textContent = 'Réserver';
    }
  };

  // ─── Pré-sélection via URL ─────────────────────────────────────────────────

  const preselected = new URLSearchParams(window.location.search).get('activity');
  if (preselected) selectedActivity = preselected;

  filterSelect?.addEventListener('change', (e) => { selectedActivity = e.target.value; renderCourses(); });

  // ─── Init ─────────────────────────────────────────────────────────────────

  initDays();
  renderDays();
  loadCourses();
});
