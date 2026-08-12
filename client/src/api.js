const BASE_URL = import.meta.env.VITE_API_URL || '';

export async function api(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const url = BASE_URL
    ? `${BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`
    : path;

  const response = await fetch(url, {
    credentials: 'include',
    // Do NOT set Content-Type for FormData — the browser sets it automatically
    // with the correct multipart boundary. If we force application/json here,
    // the server fails to parse the file upload (the 400 "Unexpected token" error).
    headers: isFormData ? { ...(options.headers || {}) } : {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      (data && (data.message || data.error || data.status)) ||
      `Request failed with status ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.response = data;
    throw err;
  }

  return data;
}
