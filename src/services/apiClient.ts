/** Adaptador fetch: interceptores de petición (JWT) y respuesta (JSON, 401, errores HTTP). */
const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const getToken = () => sessionStorage.getItem('patitasgo.jwt');
export const saveToken = (token: string) => sessionStorage.setItem('patitasgo.jwt', token);
export const clearToken = () => sessionStorage.removeItem('patitasgo.jwt');

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); this.name = 'ApiError'; }
}

// Interceptor de request: añade el token únicamente a la API configurada.
function beforeRequest(init: RequestInit): RequestInit {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (init.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return {...init,headers};
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try { response = await fetch(`${BASE_URL}${path}`, beforeRequest(init)); }
  catch { throw new ApiError(0, 'NETWORK_ERROR', 'No se pudo conectar con el servidor. Verifica que la API esté iniciada.'); }
  // Interceptor de respuesta: procesa JSON consistente y caducidad de sesiones.
  const result = response.status === 204 ? null : await response.json().catch(() => null);
  if (response.status === 401 && path !== '/api/auth/login') {
    clearToken();sessionStorage.removeItem('patitasgo.user');
    window.dispatchEvent(new Event('patitasgo:session-changed'));
  }
  if (!response.ok) throw new ApiError(response.status,result?.error?.code || 'HTTP_ERROR',result?.error?.message || `Error HTTP ${response.status}`);
  return result?.data as T;
}
