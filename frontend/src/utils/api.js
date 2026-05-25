const BASE_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem('karisma_token');
}

async function request(method, path, { body, isFormData = false } = {}) {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  console.log(BASE_URL);

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  get:    (path)          => request('GET',    path),
  post:   (path, body)    => request('POST',   path, { body }),
  patch:  (path, body)    => request('PATCH',  path, { body }),
  delete: (path)          => request('DELETE', path),
  upload: (path, formData) => request('POST',  path, { body: formData, isFormData: true }),
};
