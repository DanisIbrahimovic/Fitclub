import { apiGet, apiDelete } from '../api.js';
import { requireAdmin, logout } from '../token.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAdmin()) return;

  document.getElementById('btn-logout')?.addEventListener('click', logout);

  const tbody        = document.getElementById('activities-table-body');
  const filterForm   = document.getElementById('admin-filters-form');
  const searchTitle  = document.getElementById('search-title');
  const filterType   = document.getElementById('filter-type');

  // Charger les types pour le filtre
  const loadTypes = async () => {
    if (!filterType) return;
    try {
      const { data } = await apiGet('/public/types');
      if (data) {
        filterType.innerHTML = '<option value="">Tous les types</option>';
        data.forEach(t => { filterType.innerHTML += `<option value="${t.name}">${t.name}</option>`; });
      }
    } catch (err) {
      console.error('Erreur chargement types :', err);
    }
  };

  const loadActivities = async (filters = '') => {
    try {
      const { data } = await apiGet(`/activities${filters}`);
      tbody.innerHTML = '';

      if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px;">Aucune activité disponible.</td></tr>`;
        return;
      }

      data.forEach(act => {
        const photoSrc = act.photo ? `/uploads/${act.photo}` : 'https://via.placeholder.com/50';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><img src="${photoSrc}" alt="${act.title}" class="table-img" onerror="this.src='https://via.placeholder.com/50'"></td>
          <td><strong>${act.title}</strong></td>
          <td><span class="badge-type">${act.type || 'Non défini'}</span></td>
          <td>${act.objective || 'Non défini'}</td>
          <td>${act.durationminutes} min</td>
          <td>${act.intensity}/5</td>
          <td class="table-actions">
            <a href="/admin/activity-form.html?id=${act.id}" class="btn-edit" title="Modifier"
               style="text-decoration:none;display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:transparent;">
              <img src="/assets/icons/pencil.png" alt="Modifier" style="width:18px;height:18px;">
            </a>
            <button class="btn-delete" data-id="${act.id}" title="Supprimer"
               style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border:none;background:transparent;cursor:pointer;padding:0;">
              <img src="/assets/icons/trash.png" alt="Supprimer" style="width:18px;height:18px;pointer-events:none;">
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      tbody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          if (!confirm('Voulez-vous vraiment supprimer cette activité ?')) return;
          try {
            await apiDelete(`/activities/${e.currentTarget.dataset.id}`);
            loadActivities();
          } catch {
            alert('Erreur lors de la suppression.');
          }
        });
      });

    } catch (error) {
      console.error(error);
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:red;">Erreur de chargement des activités.</td></tr>`;
    }
  };

  const buildQueryString = () => {
    const params = [];
    if (searchTitle?.value) params.push(`title=${encodeURIComponent(searchTitle.value)}`);
    if (filterType?.value)  params.push(`type=${encodeURIComponent(filterType.value)}`);
    return params.length ? `?${params.join('&')}` : '';
  };

  const applyFilters = (e) => { e?.preventDefault(); loadActivities(buildQueryString()); };

  if (filterForm) {
    filterForm.addEventListener('submit', applyFilters);
    filterType?.addEventListener('change', applyFilters);

    let debounceTimer;
    searchTitle?.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(applyFilters, 300);
    });
  }

  await loadTypes();
  loadActivities();
});
