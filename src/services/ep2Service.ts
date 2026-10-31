import { apiRequest } from './apiClient';
import type { Animal } from './animalesService';
import type { Postulacion } from './postulacionesService';

export const listarAnimales = () => apiRequest<Animal[]>('/api/animals');
export const detalleAnimal = (id: number) => apiRequest<Animal>(`/api/animals/${id}`);
export const listarAnimalesAdmin = () => apiRequest<Animal[]>('/api/admin/animals');
export const crearAnimal = (data: Record<string,unknown>) => apiRequest<Animal>('/api/animals',{method:'POST',body:JSON.stringify(data)});
export const cambiarEstadoAnimal = (id: number,status: Animal['status']) =>
  apiRequest<Animal>(`/api/animals/${id}`,{method:'PATCH',body:JSON.stringify({status})});
export const enviarPostulacion = (animalId: number,motivation: string) =>
  apiRequest<{id:number;estado:string}>('/api/applications',{method:'POST',body:JSON.stringify({animalId,motivation})});
export const listarPostulaciones = () => apiRequest<Postulacion[]>('/api/applications');
export const detallePostulacion = (id:number) => apiRequest<Postulacion>(`/api/applications/${id}`);
export const cambiarEstadoPostulacion = (id:number,status:string,reason='') =>
  apiRequest(`/api/applications/${id}/status`,{method:'PATCH',body:JSON.stringify({status,reason})});

export interface NotificacionAPI {
 id:number; applicationId:number; estado:string; animal:string; refugio:string; fecha:string; motivo:string;
}
export const listarNotificaciones = () => apiRequest<NotificacionAPI[]>('/api/notifications');
