export const LOGIN_APP_NAME = 'app-insumos';
export const ALLOWED_ROLES = ['SuperAdmin', 'Admin', 'Responsable'];

const LOGIN_ENDPOINT = '/app/login';
const BACKEND_URL = 'http://localhost:3001';

export const loginUser = async ({ username, password }) => {
  const url = `${BACKEND_URL}${LOGIN_ENDPOINT}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (response.ok) {
      return { ok: true, data };
    }

    let message = data?.message || 'Error de autenticación. Intenta nuevamente.';

    // The backend now sends specific error messages, so we can use them directly.
    // The switch statement can be simplified.
    if (response.status === 401) {
      message = data?.message || 'Usuario o contraseña incorrectos.';
    }

    return { ok: false, status: response.status, message, data };
  } catch (error) {
    console.error('Login error:', error);
    return {
      ok: false,
      status: null,
      message: 'No se pudo contactar al servidor. Verifica tu conexión e inténtalo nuevamente.',
    };
  }
};