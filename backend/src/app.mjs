import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { query } from './db.mjs';
import { validEmail, validName, validPassword, validateAnimal, idValue, enums } from './validation.mjs';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.startsWith('replace-with') || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET debe contener al menos 32 caracteres');
const secret = process.env.JWT_SECRET;
const tokenDuration = process.env.JWT_EXPIRES_IN || '2h';
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim());
export const app = express();
app.disable('x-powered-by');
app.use(cors({ origin(origin, cb) { cb(null, !origin || allowedOrigins.includes(origin)); } }));
app.use(express.json({ limit: '32kb' }));
const asyncHandler = (fn) => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
const fail = (res,status,code,message) => res.status(status).json({error:{code,message}});
const send = (res,status,data) => res.status(status).json({data});
const publicUser = ({id,full_name,email,role}) => ({id:Number(id), name:full_name,email,role});
const animalData = (a) => ({id:Number(a.id),name:a.name,species:a.species === 'PERRO' ? 'Perro' : 'Gato',gender:a.gender === 'MACHO' ? 'Macho' : 'Hembra',age:a.age_text,size:({PEQUEÑO:'Pequeño',MEDIANO:'Mediano',GRANDE:'Grande'})[a.size],status:a.status,tags:a.tags,description:a.description,shelter:a.shelter,location:a.location,distance:a.distance_text,health:a.health,image:a.image_url});
const appData = (a) => ({id:Number(a.id),animalId:Number(a.animal_id),animal:a.animal,refugio:a.refugio,postulante:a.postulante,fecha:a.created_at,estado:a.status,motivacion:a.motivation,historial:[]});

async function startSession(user) {
  const sid = randomUUID();
  const token = jwt.sign({ sub:String(user.id), role:user.role, sid }, secret, { expiresIn:tokenDuration, issuer:'patitasgo', audience:'patitasgo-web' });
  const decoded = jwt.decode(token);
  await query('INSERT INTO sessions(id,user_id,expires_at) VALUES($1,$2,to_timestamp($3))', [sid,user.id,decoded.exp]);
  return {token,user:publicUser(user)};
}
async function authenticate(req,res,next) {
  try {
    const match = /^Bearer (.+)$/i.exec(req.headers.authorization || '');
    if (!match) return fail(res,401,'AUTH_REQUIRED','Debes iniciar sesión');
    const payload = jwt.verify(match[1],secret,{issuer:'patitasgo',audience:'patitasgo-web'});
    if (!payload.sid || !idValue(payload.sub)) return fail(res,401,'INVALID_TOKEN','Token no válido');
    const result = await query(`SELECT u.id,u.email,u.full_name,u.role FROM sessions s JOIN users u ON u.id=s.user_id
      WHERE s.id=$1 AND s.user_id=$2 AND s.revoked_at IS NULL AND s.expires_at>now() AND u.active=true`,[payload.sid,payload.sub]);
    if (!result.rowCount) return fail(res,401,'INVALID_SESSION','La sesión ya no está activa');
    req.user=result.rows[0]; req.sid=payload.sid;
    next();
  } catch (error) {
    if (error.name==='JsonWebTokenError' || error.name==='TokenExpiredError' || error.name==='NotBeforeError') return fail(res,401,'INVALID_TOKEN','Token inválido o expirado');
    next(error);
  }
}
const role = (name) => (req,res,next) => req.user?.role===name ? next() : fail(res,403,'FORBIDDEN','No tienes permisos para esta operación');

app.get('/api/health',asyncHandler(async(_req,res)=> {await query('SELECT 1'); send(res,200,{status:'ok'}); }));
app.post('/api/auth/register',asyncHandler(async(req,res)=>{
  const {name,email,password}=req.body || {};
  if (!validName(name)||!validEmail(email)||!validPassword(password)) return fail(res,400,'VALIDATION_ERROR','Nombre, correo o contraseña inválidos (mín. 8 caracteres, mayúscula, número y símbolo)');
  const hash=await bcrypt.hash(password,12);
  const {rows}=await query("INSERT INTO users(full_name,email,password_hash,role) VALUES($1,$2,$3,'user') RETURNING id,full_name,email,role",[name.trim(),email.toLowerCase().trim(),hash]);
  return send(res,201,await startSession(rows[0]));
}));
app.post('/api/auth/login',asyncHandler(async(req,res)=>{
  const {email,password}=req.body || {};
  if (!validEmail(email)||typeof password !== 'string') return fail(res,400,'VALIDATION_ERROR','Correo y contraseña requeridos');
  const {rows}=await query('SELECT id,full_name,email,role,password_hash FROM users WHERE email=$1 AND active=true',[email.toLowerCase().trim()]);
  // Comprobación de hash incluso si no existe usuario para reducir diferencias de tiempo.
  const fallback='$2b$12$rZI9Gs2QwoFMSibBG7HDIuHC4vqgrw8ouHi8W8g3BSZRmo/qSsx/G';
  const verified=await bcrypt.compare(password,rows[0]?.password_hash || fallback);
  if (!rows[0]||!verified) return fail(res,401,'BAD_CREDENTIALS','Credenciales incorrectas');
  send(res,200,await startSession(rows[0]));
}));
app.get('/api/auth/me',authenticate,(req,res)=>send(res,200,publicUser(req.user)));
app.post('/api/auth/logout',authenticate,asyncHandler(async(req,res)=>{
  await query('UPDATE sessions SET revoked_at=now() WHERE id=$1',[req.sid]);
  res.status(204).end();
}));

app.get('/api/animals',asyncHandler(async(req,res)=>{
  const conditions=["status='DISPONIBLE'"]; const params=[];
  if (req.query.species) {if (!enums.species.includes(req.query.species)) return fail(res,400,'VALIDATION_ERROR','Especie inválida'); params.push(req.query.species); conditions.push(`species=$${params.length}`);}
  if (req.query.size) {if (!enums.size.includes(req.query.size)) return fail(res,400,'VALIDATION_ERROR','Tamaño inválido'); params.push(req.query.size); conditions.push(`size=$${params.length}`);}
  if (req.query.search) {params.push(`%${String(req.query.search).slice(0,100)}%`); conditions.push(`name ILIKE $${params.length}`);}
  const {rows}=await query(`SELECT * FROM animals WHERE ${conditions.join(' AND ')} ORDER BY id DESC LIMIT 100`,params);
  send(res,200,rows.map(animalData));
}));
app.get('/api/animals/:id',asyncHandler(async(req,res)=>{
  const id=idValue(req.params.id); if(!id) return fail(res,400,'VALIDATION_ERROR','ID inválido');
  const {rows}=await query("SELECT * FROM animals WHERE id=$1 AND status='DISPONIBLE'",[id]);
  return rows[0]?send(res,200,animalData(rows[0])):fail(res,404,'NOT_FOUND','Animal no encontrado');
}));

app.get('/api/admin/animals',authenticate,role('admin'),asyncHandler(async(req,res)=>{
  const {rows}=await query('SELECT * FROM animals ORDER BY id DESC LIMIT 200');send(res,200,rows.map(animalData));
}));
app.post('/api/animals',authenticate,role('admin'),asyncHandler(async(req,res)=>{
  const body=req.body||{}; const invalid=validateAnimal(body);
  if(invalid) return fail(res,400,'VALIDATION_ERROR',invalid);
  const v=[body.name.trim(),body.species,body.gender,body.age.trim(),body.size,body.status||'BORRADOR',body.description||'',body.shelter||'PatitasGo',body.location.trim(),body.health||'Sin información médica',body.image||'',body.tags||[],req.user.id];
  const {rows}=await query(`INSERT INTO animals(name,species,gender,age_text,size,status,description,shelter,location,health,image_url,tags,created_by)
  VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,v);
  send(res,201,animalData(rows[0]));
}));
app.patch('/api/animals/:id',authenticate,role('admin'),asyncHandler(async(req,res)=>{
  const id=idValue(req.params.id),b=req.body||{};
  if(!id) return fail(res,400,'VALIDATION_ERROR','ID inválido');
  const invalid=validateAnimal(b,{partial:true});if(invalid)return fail(res,400,'VALIDATION_ERROR',invalid);
  const columns={name:'name',species:'species',gender:'gender',age:'age_text',size:'size',status:'status',description:'description',shelter:'shelter',location:'location',health:'health',image:'image_url',tags:'tags'};
  const entries=Object.entries(columns).filter(([key])=>Object.prototype.hasOwnProperty.call(b,key));
  if(!entries.length)return fail(res,400,'VALIDATION_ERROR','No se proporcionaron campos modificables');
  const {rows:existing}=await query('SELECT * FROM animals WHERE id=$1',[id]);
  if(!existing.length)return fail(res,404,'NOT_FOUND','Animal no encontrado');
  if(b.status==='DISPONIBLE' && !(b.image || existing[0].image_url))return fail(res,400,'VALIDATION_ERROR','Se requiere imagen para publicar');
  const values=entries.map(([key])=>b[key]);values.push(id);
  const changes=entries.map(([,col],i)=>`${col}=$${i+1}`).join(', ');
  const {rows}=await query(`UPDATE animals SET ${changes},updated_at=now() WHERE id=$${values.length} RETURNING *`,values);
  send(res,200,animalData(rows[0]));
}));
app.delete('/api/animals/:id',authenticate,role('admin'),asyncHandler(async(req,res)=>{
  const id=idValue(req.params.id);if(!id)return fail(res,400,'VALIDATION_ERROR','ID inválido');
  const {rowCount}=await query("UPDATE animals SET status='ARCHIVADO',updated_at=now() WHERE id=$1",[id]);
  return rowCount?res.status(204).end():fail(res,404,'NOT_FOUND','Animal no encontrado');
}));

app.post('/api/applications',authenticate,role('user'),asyncHandler(async(req,res)=>{
  const id=idValue(req.body?.animalId), motivation=req.body?.motivation;
  if(!id||typeof motivation!=='string'||motivation.trim().length<10||motivation.length>3000)return fail(res,400,'VALIDATION_ERROR','Animal y motivación de al menos 10 caracteres requeridos');
  const client=await (await import('./db.mjs')).db.connect();
  try {
    await client.query('BEGIN');
    const available=await client.query("SELECT id FROM animals WHERE id=$1 AND status='DISPONIBLE' FOR SHARE",[id]);
    if(!available.rowCount){await client.query('ROLLBACK');return fail(res,404,'NOT_FOUND','Animal no disponible');}
    const {rows}=await client.query(`INSERT INTO applications(animal_id,user_id,motivation) VALUES($1,$2,$3) RETURNING id,animal_id,status`,[id,req.user.id,motivation.trim()]);
    await client.query('INSERT INTO application_events(application_id,actor_id,to_status) VALUES($1,$2,$3)',[rows[0].id,req.user.id,'PENDIENTE']);
    await client.query('COMMIT');send(res,201,{id:Number(rows[0].id),animalId:id,estado:'PENDIENTE'});
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}));
const APP_SELECT=`SELECT a.*, an.name AS animal,an.shelter AS refugio,u.full_name AS postulante
  FROM applications a JOIN animals an ON a.animal_id=an.id JOIN users u ON a.user_id=u.id`;
app.get('/api/applications',authenticate,asyncHandler(async(req,res)=>{
  const isAdmin=req.user.role==='admin';
  const {rows}=await query(`${APP_SELECT} ${isAdmin?'':'WHERE a.user_id=$1'} ORDER BY a.created_at DESC LIMIT 200`,isAdmin?[]:[req.user.id]);
  send(res,200,rows.map(appData));
}));
// Eventos auténticos vinculados únicamente a postulaciones del usuario autenticado.
// La tabla application_events ya forma parte del esquema; no requiere migraciones.
app.get('/api/notifications',authenticate,role('user'),asyncHandler(async(req,res)=>{
  const {rows}=await query(`SELECT ev.id,ev.application_id,ev.to_status,ev.reason,ev.created_at,
      an.name AS animal,an.shelter AS shelter
    FROM application_events ev
    JOIN applications ap ON ap.id=ev.application_id
    JOIN animals an ON an.id=ap.animal_id
    WHERE ap.user_id=$1
    ORDER BY ev.created_at DESC,ev.id DESC LIMIT 100`,[req.user.id]);
  send(res,200,rows.map(row=>({
    id:Number(row.id),applicationId:Number(row.application_id),estado:row.to_status,
    animal:row.animal,refugio:row.shelter,fecha:row.created_at,
    motivo:row.reason || ''
  })));
}));
app.get('/api/applications/:id',authenticate,asyncHandler(async(req,res)=>{
  const id=idValue(req.params.id);if(!id)return fail(res,400,'VALIDATION_ERROR','ID inválido');
  const {rows}=await query(`${APP_SELECT} WHERE a.id=$1 ${req.user.role==='admin'?'':'AND a.user_id=$2'}`,[id,...(req.user.role==='admin'?[]:[req.user.id])]);
  if(!rows.length)return fail(res,404,'NOT_FOUND','Postulación no encontrada');
  const {rows:events}=await query('SELECT to_status,reason,created_at FROM application_events WHERE application_id=$1 ORDER BY created_at',[id]);
  const result=appData(rows[0]);result.historial=events.map(e=>({fecha:e.created_at,detalle:`Estado: ${e.to_status}${e.reason?' - '+e.reason:''}`}));send(res,200,result);
}));
app.patch('/api/applications/:id/status',authenticate,role('admin'),asyncHandler(async(req,res)=>{
  const id=idValue(req.params.id), nextStatus=req.body?.status, reason=req.body?.reason||'';
  if(!id||!enums.applicationStatus.includes(nextStatus)||typeof reason!=='string'||reason.length>1000)return fail(res,400,'VALIDATION_ERROR','Estado o motivo inválido');
  const transitions={PENDIENTE:['EN_REVISION','RECHAZADA'],EN_REVISION:['APROBADA','RECHAZADA'],APROBADA:[],RECHAZADA:[]};
  const client=await (await import('./db.mjs')).db.connect();
  try {
    await client.query('BEGIN');
    const {rows}=await client.query('SELECT status FROM applications WHERE id=$1 FOR UPDATE',[id]);
    if(!rows.length){await client.query('ROLLBACK');return fail(res,404,'NOT_FOUND','Postulación no encontrada');}
    if(!transitions[rows[0].status]?.includes(nextStatus)){await client.query('ROLLBACK');return fail(res,409,'INVALID_TRANSITION','Transición de estado no permitida');}
    await client.query('UPDATE applications SET status=$1,review_reason=$2,reviewed_by=$3,updated_at=now() WHERE id=$4',[nextStatus,reason,req.user.id,id]);
    await client.query('INSERT INTO application_events(application_id,actor_id,from_status,to_status,reason) VALUES($1,$2,$3,$4,$5)',[id,req.user.id,rows[0].status,nextStatus,reason]);
    await client.query('COMMIT');send(res,200,{id,estado:nextStatus});
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}));

app.use((req,res)=>fail(res,404,'NOT_FOUND','Ruta no encontrada'));
app.use((error,_req,res,_next)=>{
  if(error?.type==='entity.parse.failed')return fail(res,400,'INVALID_JSON','JSON inválido');
  if(error?.code==='23505')return fail(res,409,'ALREADY_EXISTS','Ya existe ese registro');
  if(['23503','23514','23502','22P02'].includes(error?.code))return fail(res,400,'DATA_CONSTRAINT','Datos inválidos o referencia inexistente');
  console.error('API error:',error);
  return fail(res,500,'INTERNAL_ERROR','Error interno del servidor');
});
