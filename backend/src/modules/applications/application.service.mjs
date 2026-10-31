import {applicationRepository} from './application.repository.mjs';
import {toApplication,toHistoryEvent,toNotification} from './application.mapper.mjs';
export class ApplicationError extends Error {
  constructor(status,code,message){super(message);this.name='ApplicationError';this.status=status;this.code=code;}
}
const transitions=Object.freeze({
  PENDIENTE:['EN_REVISION','RECHAZADA'],
  EN_REVISION:['APROBADA','RECHAZADA'],
  APROBADA:[], RECHAZADA:[]
});
/** Casos de uso desacoplados de Express; repositorio inyectable para pruebas. */
export const createApplicationService=(repository=applicationRepository)=>({
  async list(user){return (await repository.list(user)).map(toApplication);},
  async detail(id,user){
    const row=await repository.find(id,user);
    if(!row)throw new ApplicationError(404,'NOT_FOUND','Postulación no encontrada');
    return {...toApplication(row),historial:(await repository.history(id)).map(toHistoryEvent)};
  },
  async notifications(userId){return (await repository.notifications(userId)).map(toNotification);},
  async create({animalId,userId,motivation}){
    return repository.transaction(async client=>{
      const available=await client.query("SELECT id FROM animals WHERE id=$1 AND status='DISPONIBLE' FOR SHARE",[animalId]);
      if(!available.rowCount)throw new ApplicationError(404,'NOT_FOUND','Animal no disponible');
      const {rows}=await client.query(
        'INSERT INTO applications(animal_id,user_id,motivation) VALUES($1,$2,$3) RETURNING id,animal_id,status',
        [animalId,userId,motivation.trim()]);
      await client.query('INSERT INTO application_events(application_id,actor_id,to_status) VALUES($1,$2,$3)',[rows[0].id,userId,'PENDIENTE']);
      return {id:Number(rows[0].id),animalId,estado:'PENDIENTE'};
    });
  },
  async changeStatus({id,status,reason,actorId}){
    return repository.transaction(async client=>{
      const {rows}=await client.query('SELECT status FROM applications WHERE id=$1 FOR UPDATE',[id]);
      if(!rows.length)throw new ApplicationError(404,'NOT_FOUND','Postulación no encontrada');
      if(!transitions[rows[0].status]?.includes(status))
        throw new ApplicationError(409,'INVALID_TRANSITION','Transición de estado no permitida');
      await client.query('UPDATE applications SET status=$1,review_reason=$2,reviewed_by=$3,updated_at=now() WHERE id=$4',
        [status,reason,actorId,id]);
      await client.query('INSERT INTO application_events(application_id,actor_id,from_status,to_status,reason) VALUES($1,$2,$3,$4,$5)',
        [id,actorId,rows[0].status,status,reason]);
      return {id,estado:status};
    });
  }
});
export const applicationService=createApplicationService();
