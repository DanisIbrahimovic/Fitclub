/**
 * Base helper for API requests.
 * Automatically adds Authorization token from sessionStorage
 * and handles JSON parsing / error throwing.
 */
async function apiFetch(endpoint, options = {}) {
  const token = sessionStorage.getItem('token');
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set Content-Type to application/json if body is present and not FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  let responseData;
  try {
    // Attempt to parse JSON response
    responseData = await response.json();
  } catch (err) {
    responseData = null;
  }

  if (!response.ok) {
    const errorMessage = responseData?.error || responseData?.message || `Erreur: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return responseData;
}

export async function apiGet(endpoint) {
  return apiFetch(endpoint, { method: 'GET' });
}

export async function apiPost(endpoint, data) {
  return apiFetch(endpoint, { method: 'POST', body: data });
}

export async function apiPut(endpoint, data) {
  return apiFetch(endpoint, { method: 'PUT', body: data });
}

export async function apiDelete(endpoint) {
  return apiFetch(endpoint, { method: 'DELETE' });
}
