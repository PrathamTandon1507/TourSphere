export async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
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
