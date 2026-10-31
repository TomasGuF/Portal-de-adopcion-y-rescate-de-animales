import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';

const enabled = Boolean(process.env.TEST_DATABASE_URL);
let request, app, db;
before(async()=>{
  if (!enabled) return;
  if (!process.env.TEST_DATABASE_URL.includes('test')) throw new Error('TEST_DATABASE_URL debe apuntar a una base de pruebas');
  process.env.DATABASE_URL=process.env.TEST_DATABASE_URL;
  process.env.JWT_SECRET=process.env.JWT_SECRET || 'test-only-secret-which-is-longer-than-32-characters';
  ({default:request}=await import('supertest'));
  ({app}=await import('../src/app.mjs'));
  ({db}=await import('../src/db.mjs'));
  const {readFile}=await import('node:fs/promises');
  await db.query(await readFile(new URL('../sql/schema.sql',import.meta.url),'utf8'));
});
after(async()=>{if(db)await db.end();});

test('registro, JWT, sesión y privilegios admin', {skip:!enabled}, async()=>{
  const email=`test-${randomUUID()}@example.cl`;
  const user=await request(app).post('/api/auth/register').send({name:'Prueba EP2',email,password:'TestPassword123!'});
  assert.equal(user.status,201);
  assert.equal(user.body.data.user.role,'user');
  assert.ok(user.body.data.token);
  const bad=await request(app).post('/api/auth/login').send({email,password:'equivocada'});
  assert.equal(bad.status,401);
  const token=user.body.data.token;
  assert.equal((await request(app).get('/api/auth/me').set('Authorization',`Bearer ${token}`)).status,200);
  assert.equal((await request(app).post('/api/animals').set('Authorization',`Bearer ${token}`).send({})).status,403);
  assert.equal((await request(app).get('/api/admin/animals').set('Authorization',`Bearer ${token}`)).status,403);
  assert.equal((await request(app).post('/api/auth/logout').set('Authorization',`Bearer ${token}`)).status,204);
  assert.equal((await request(app).get('/api/auth/me').set('Authorization',`Bearer ${token}`)).status,401);
});

test('API REST valida entradas y oculta registros no publicados', {skip:!enabled}, async()=>{
  assert.equal((await request(app).get('/api/health')).status,200);
  assert.equal((await request(app).get('/api/animals/1%20OR%201=1')).status,400);
  assert.equal((await request(app).post('/api/auth/register').send({name:'X',email:'invalid',password:'123'})).status,400);
  const list=await request(app).get('/api/animals');
  assert.equal(list.status,200);
  assert.ok(Array.isArray(list.body.data));
});

test('flujo completo: admin -> animal -> postulación -> estado -> archivado', {skip:!enabled}, async()=>{
  const password='TestPassword123!';
  const userEmail=`adoptante-${randomUUID()}@example.cl`;
  const adminEmail=`admin-${randomUUID()}@example.cl`;
  const userResponse=await request(app).post('/api/auth/register').send({name:'Usuario de Prueba',email:userEmail,password});
  assert.equal(userResponse.status,201);
  const userToken=userResponse.body.data.token;
  const bcrypt=(await import('bcrypt')).default;
  await db.query("INSERT INTO users(full_name,email,password_hash,role) VALUES($1,$2,$3,'admin')",['Admin de Prueba',adminEmail,await bcrypt.hash(password,12)]);
  const login=await request(app).post('/api/auth/login').send({email:adminEmail,password});
  assert.equal(login.status,200);
  const adminToken=login.body.data.token;
  const create=await request(app).post('/api/animals').set('Authorization',`Bearer ${adminToken}`).send({
    name:'Animal de test',species:'PERRO',gender:'HEMBRA',age:'1 año',size:'MEDIANO',location:'Valparaíso',
    image:'https://example.com/animal.jpg'
  });
  assert.equal(create.status,201);
  assert.equal(create.body.data.status,'BORRADOR');
  const animalId=create.body.data.id;
  assert.equal((await request(app).get(`/api/animals/${animalId}`)).status,404);
  const publish=await request(app).patch(`/api/animals/${animalId}`).set('Authorization',`Bearer ${adminToken}`).send({status:'DISPONIBLE'});
  assert.equal(publish.status,200);
  assert.equal((await request(app).get(`/api/animals/${animalId}`)).status,200);
  const apply=await request(app).post('/api/applications').set('Authorization',`Bearer ${userToken}`).send({animalId,motivation:'Quiero adoptar a este animal para cuidarlo bien.'});
  assert.equal(apply.status,201);
  const appId=apply.body.data.id;
  const second=await request(app).post('/api/auth/register').send({name:'Segundo Usuario',email:`otro-${randomUUID()}@example.cl`,password});
  const secondToken=second.body.data.token;
  assert.equal((await request(app).get(`/api/applications/${appId}`).set('Authorization',`Bearer ${secondToken}`)).status,404);
  const next=await request(app).patch(`/api/applications/${appId}/status`).set('Authorization',`Bearer ${adminToken}`).send({status:'EN_REVISION'});
  assert.equal(next.status,200);
  assert.equal((await request(app).patch(`/api/applications/${appId}/status`).set('Authorization',`Bearer ${adminToken}`).send({status:'PENDIENTE'})).status,409);
  const ownNotifications=await request(app).get('/api/notifications').set('Authorization',`Bearer ${userToken}`);
  assert.equal(ownNotifications.status,200);
  assert.ok(ownNotifications.body.data.some(item=>item.applicationId===appId && item.estado==='EN_REVISION'));
  const otherNotifications=await request(app).get('/api/notifications').set('Authorization',`Bearer ${secondToken}`);
  assert.equal(otherNotifications.status,200);
  assert.ok(!otherNotifications.body.data.some(item=>item.applicationId===appId));
  assert.equal((await request(app).get('/api/notifications')).status,401);
  const detail=await request(app).get(`/api/applications/${appId}`).set('Authorization',`Bearer ${userToken}`);
  assert.equal(detail.status,200);
  assert.equal(detail.body.data.estado,'EN_REVISION');
  assert.equal(detail.body.data.historial.length,2);
  assert.equal((await request(app).delete(`/api/animals/${animalId}`).set('Authorization',`Bearer ${adminToken}`)).status,204);
  assert.equal((await request(app).get(`/api/animals/${animalId}`)).status,404);
});
