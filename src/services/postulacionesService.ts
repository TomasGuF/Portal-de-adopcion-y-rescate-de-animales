/** Tipos y etiquetas compartidas. Las solicitudes reales provienen de ep2Service, no de mocks. */
export type EstadoPostulacion = 'PENDIENTE' | 'EN_REVISION' | 'APROBADA' | 'RECHAZADA';

export interface Postulacion {
  id: number;
  animalId: number;
  animal: string;
  refugio: string;
  postulante: string;
  fecha: string;
  estado: EstadoPostulacion;
  motivacion: string;
  historial: { fecha: string; detalle: string }[];
}

export const ETIQUETA_ESTADO: Record<EstadoPostulacion, { texto: string; color: string }> = {
  PENDIENTE: { texto: 'Pendiente', color: 'warning' },
  EN_REVISION: { texto: 'En revisión', color: 'primary' },
  APROBADA: { texto: 'Aprobada', color: 'success' },
  RECHAZADA: { texto: 'Rechazada', color: 'danger' }
};
