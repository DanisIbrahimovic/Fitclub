import { apiGet } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('activities-grid');
    const form = document.getElementById('filters-form');
    
    const typeSelect = document.getElementById('filter-type');
    const objectiveSelect = document.getElementById('filter-objective');

    // 1. Charger les filtres dynamiquement
    const loadFilters = async () => {
        try {
            if(typeSelect && objectiveSelect) {
                const [typesResult, objResult] = await Promise.all([
                    apiGet('/public/types'),
                    apiGet('/public/objectives')
                ]);
                
                if (typesResult.data) {
                    typeSelect.innerHTML = '<option value="">Tous les types</option>';
                    typesResult.data.forEach(t => {
                        typeSelect.innerHTML += `<option value="${t.name}">${t.name}</option>`;
                    });
                }
                
                if (objResult.data) {
                    objectiveSelect.innerHTML = '<option value="">Tous les objectifs</option>';
                    objResult.data.forEach(o => {
                        objectiveSelect.innerHTML += `<option value="${o.name}">${o.name}</option>`;
                    });
                }
            }
        } catch (err) {
            console.error("Erreur chargement filtres :", err);
        }
    };

    // 2. Charger les activités
    const loadPublicActivities = async (filters = "") => {
        try {
            const result = await apiGet(`/public/activities${filters}`);
            grid.innerHTML = '';

            if (!result.data || result.data.length === 0) {
                grid.innerHTML = `<p style="text-align:center; grid-column: 1/-1; padding: 40px; color: #666;">Aucune activité trouvée pour vos critères.</p>`;
                return;
            }

            result.data.forEach(act => {
                const article = document.createElement('article');
                article.className = 'activity-card';

                const photoSrc = act.photo ? `/uploads/${act.photo}` : 'https://via.placeholder.com/400x250?text=FitClub';
                const typeName = act.type || 'Général';
                
                article.innerHTML = `
                    <div class="activity-photo">
                        <img src="${photoSrc}" alt="${act.title}" onerror="this.src='https://via.placeholder.com/400x250?text=FitClub'">
                        <span class="activity-badge badge-type">${typeName}</span>
                    </div>
                    <div class="activity-body">
                        <h3>${act.title}</h3>
                        <p class="activity-desc">${act.description}</p>
                        <ul class="activity-meta">
                            <li><strong>Objectif:</strong> ${act.objective || 'Non défini'}</li>
                            <li><strong>Durée:</strong> ${act.durationminutes} min</li>
                            <li><strong>Calories:</strong> ~${act.calories} kcal</li>
                            <li><strong>Intensité:</strong> ${act.intensity}/5</li>
                        </ul>
                        <a href="/planning.html?activity=${encodeURIComponent(act.title)}" class="btn-primary" style="display: block; text-align: center;">Voir le planning</a>
                    </div>
                `;
                grid.appendChild(article);
            });
        } catch (error) {
            console.error("Erreur de chargement:", error);
            grid.innerHTML = `<p style="text-align:center; grid-column: 1/-1; padding: 40px; color: red;">Erreur lors du chargement des activités.</p>`;
        }
    };

    // Initialisation
    await loadFilters();
    await loadPublicActivities();

    // Gestion de la recherche (filtres)
    const applyFilters = (e) => {
        if (e) e.preventDefault();
        const searchTitle = document.getElementById('search-title').value;
        const filterType = typeSelect.value;
        const filterObjective = objectiveSelect.value;

        let queryParams = [];
        if (searchTitle) queryParams.push(`title=${encodeURIComponent(searchTitle)}`);
        if (filterType !== "") queryParams.push(`type=${encodeURIComponent(filterType)}`);
        if (filterObjective !== "") queryParams.push(`objective=${encodeURIComponent(filterObjective)}`);

        const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
        loadPublicActivities(queryString);
    };

    if (form) {
        form.addEventListener('submit', applyFilters);
        
        if (typeSelect) typeSelect.addEventListener('change', applyFilters);
        if (objectiveSelect) objectiveSelect.addEventListener('change', applyFilters);
        
        const searchInput = document.getElementById('search-title');
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(applyFilters, 300);
            });
        }
    }
});
