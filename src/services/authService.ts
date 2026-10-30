import { apiRequest, clearToken, getToken, saveToken } from './apiClient';
export type Rol = 'user' | 'admin';
interface UserSession { id: number; name: string; email: string; role: Rol; }
interface AuthResponse { token: string; user: UserSession; }
const KEY = 'patitasgo.user';
const saveSession = (result: AuthResponse) => {
  saveToken(result.token);
  sessionStorage.setItem(KEY, JSON.stringify(result.user));
  window.dispatchEvent(new Event('patitasgo:session-changed'));
  return result.user.role;
};
export const iniciarSesion = async (email: string, password: string): Promise<Rol> =>
  saveSession(await apiRequest<AuthResponse>('/api/auth/login',{method:'POST',body:JSON.stringify({email,password})}));
export const registrarUsuario = async (name: string, email: string, password: string): Promise<Rol> =>
  saveSession(await apiRequest<AuthResponse>('/api/auth/register',{method:'POST',body:JSON.stringify({name,email,password})}));
export const cerrarSesion = () => {
  const token = getToken();
  if (token) void apiRequest('/api/auth/logout',{method:'POST'}).catch(()=>{});
  clearToken();sessionStorage.removeItem(KEY);
  window.dispatchEvent(new Event('patitasgo:session-changed'));
};
export const estaAutenticado = () => {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
    if (typeof payload.exp === 'number' && Date.now() >= payload.exp * 1000) {
      clearToken();sessionStorage.removeItem(KEY);return false;
    }
    return true;
  } catch { clearToken();sessionStorage.removeItem(KEY);return false; }
};
export const obtenerRol = (): Rol | null => {
  if (!estaAutenticado()) return null;
  try { return (JSON.parse(sessionStorage.getItem(KEY) || '{}') as UserSession).role || null; } catch { return null; }
};
export const obtenerEmail = () => {
  try {return (JSON.parse(sessionStorage.getItem(KEY) || '{}') as UserSession).email || '';}catch{return '';}
};
export const rutaInicioPorRol = (rol: Rol | null) => rol === 'admin' ? '/admin/resumen' : '/catalogo';
