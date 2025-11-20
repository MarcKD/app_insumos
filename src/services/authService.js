export const LOGIN_APP_NAME = 'app-insumos';
export const ALLOWED_ROLES = ['SuperAdmin', 'Admin', 'Responsable'];

const LOGIN_ENDPOINT = '/app/login';

const buildLoginUrl = (next) => {
  if (!next) return LOGIN_ENDPOINT;
  const params = new URLSearchParams({ next });
  return `${LOGIN_ENDPOINT}?${params.toString()}`;
};

export const loginUser = async ({ username, password, next }) => {
  const url = buildLoginUrl(next);

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

    let message = 'Error de autenticación. Intenta nuevamente.';

    switch (response.status) {
      case 401:
        message = 'Usuario o contraseña incorrectos.';
        break;
      case 403:
        message = 'No tienes permisos para ingresar a esta aplicación.';
        break;
      case 423:
        message = 'Tu cuenta está bloqueada por intentos fallidos. Contacta a un administrador.';
        break;
      default:
        message = 'No se pudo procesar la solicitud en este momento.';
    }

    return { ok: false, status: response.status, message, data };
  } catch (error) {
    return {
      ok: false,
      status: null,
      message: 'No se pudo contactar al servidor. Verifica tu conexión e inténtalo nuevamente.',
    };
  }
};
