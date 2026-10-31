import {db,query} from '../../db.mjs';

const SELECT=`SELECT a.*,an.name AS animal,an.shelter AS refugio,u.full_name AS postulante
  FROM applications a JOIN animals an ON a.animal_id=an.id JOIN users u ON a.user_id=u.id`;

export const applicationRepository = {
  list: async (user) => {
    const admin = user.role==='admin';
    const {rows}=await query(`${SELECT} ${admin?'':'WHERE a.user_id=$1'} ORDER BY a.created_at DESC LIMIT 200`,admin?[]:[user.id]);
    return rows;
  },
  find: async (id,user) => {
    const admin=user.role==='admin';
    const {rows}=await query(`${SELECT} WHERE a.id=$1 ${admin?'':'AND a.user_id=$2'}`,admin?[id]:[id,user.id]);
    return rows[0] ?? null;
  },
  history: async (id) => {
    const {rows}=await query('SELECT to_status,reason,created_at FROM application_events WHERE application_id=$1 ORDER BY created_at',[id]);
    return rows;
  },
  notifications: async (userId) => {
    const {rows}=await query(`SELECT ev.id,ev.application_id,ev.to_status,ev.reason,ev.created_at,
      an.name AS animal,an.shelter AS shelter
      FROM application_events ev
      JOIN applications ap ON ap.id=ev.application_id
      JOIN animals an ON an.id=ap.animal_id
      WHERE ap.user_id=$1 ORDER BY ev.created_at DESC,ev.id DESC LIMIT 100`,[userId]);
    return rows;
  },
  transaction: async (work) => {
    const client=await db.connect();
    try {
      await client.query('BEGIN');
      const result=await work(client);
      await client.query('COMMIT');
      return result;
    }catch(error){await client.query('ROLLBACK');throw error;}
    finally{client.release();}
  }
};
