import { apiGet, apiPost, apiPut } from '../api.js';
import { requireAdmin, logout } from '../token.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAdmin()) return;

  document.getElementById('btn-logout')?.addEventListener('click', logout);

  const form       = document.getElementById('activity-form');
  const formError  = document.getElementById('form-error');
  const formTitle  = document.getElementById('form-title');
  const typeSelect = document.getElementById('activitytypeid');
  const objSelect  = document.getElementById('objectiveid');

  // Charger les types et objectifs
  try {
    const [{ data: types }, { data: objectives }] = await Promise.all([
      apiGet('/public/types'),
      apiGet('/public/objectives'),
    ]);

    if (types) {
      typeSelect.innerHTML = '<option value="">Sélectionner un type</option>';
      types.forEach(t => { typeSelect.innerHTML += `<option value="${t.id}">${t.name}</option>`; });
    }
    if (objectives) {
      objSelect.innerHTML = '<option value="">Sélectionner un objectif</option>';
      objectives.forEach(o => { objSelect.innerHTML += `<option value="${o.id}">${o.name}</option>`; });
    }
  } catch (err) {
    console.error('Erreur de chargement des types/objectifs :', err);
  }

  // Mode édition si un ID est présent dans l'URL
  const activityId = new URLSearchParams(window.location.search).get('id');

  if (activityId) {
    formTitle.textContent = "Modifier l'activité";
    try {
      const { data: act } = await apiGet(`/activities/${activityId}`);
      if (act) {
        document.getElementById('title').value           = act.title;
        document.getElementById('description').value     = act.description;
        document.getElementById('activitytypeid').value  = act.activitytypeid;
        document.getElementById('objectiveid').value     = act.objectiveid;
        document.getElementById('durationminutes').value = act.durationminutes;
        document.getElementById('intensity').value       = act.intensity;
        document.getElementById('calories').value        = act.calories;
      }
    } catch {
      formError.style.display = 'block';
      formError.textContent   = "Erreur lors du chargement de l'activité.";
    }
  }

  // Soumission du formulaire
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.style.display = 'none';

    try {
      const formData = new FormData(form);
      if (activityId) {
        await apiPut(`/activities/${activityId}`, formData);
      } else {
        await apiPost('/activities', formData);
      }
      window.location.href = '/admin/activities.html';
    } catch (error) {
      console.error('Submit error:', error);
      formError.style.display = 'block';
      formError.textContent   = error.message || "Une erreur est survenue lors de l'enregistrement.";
    }
  });
});
