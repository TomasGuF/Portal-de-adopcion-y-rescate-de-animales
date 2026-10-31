/** Contrato público de EP2: no cambiar las claves del JSON. */
export const toApplication = (row) => ({
  id:Number(row.id),animalId:Number(row.animal_id),animal:row.animal,
  refugio:row.refugio,postulante:row.postulante,fecha:row.created_at,
  estado:row.status,motivacion:row.motivation,historial:[]
});
export const toHistoryEvent = (event) => ({
  fecha:event.created_at,
  detalle:`Estado: ${event.to_status}${event.reason?' - '+event.reason:''}`
});
export const toNotification = (row) => ({
  id:Number(row.id), applicationId:Number(row.application_id),
  estado:row.to_status, animal:row.animal, refugio:row.shelter,
  fecha:row.created_at, motivo:row.reason || ''
});
