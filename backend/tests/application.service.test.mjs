import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApplicationService} from '../src/modules/applications/application.service.mjs';

const sample={id:7,animal_id:2,animal:'Luna',refugio:'Refugio Patitas',postulante:'Usuario',created_at:'2026-10-30',status:'PENDIENTE',motivation:'Motivación'};
test('listado conserva contrato público y limita resultados al repositorio',async()=>{
 let received;
 const service=createApplicationService({list:async user=>{received=user;return [sample]}});
 const result=await service.list({id:99,role:'user'});
 assert.equal(received.id,99);
 assert.deepEqual(result[0].historial,[]);
 assert.equal(result[0].animal,'Luna');
 assert.equal(result[0].estado,'PENDIENTE');
});
test('detalle ausente retorna NOT_FOUND',async()=>{
 const service=createApplicationService({find:async()=>null});
 await assert.rejects(()=>service.detail(99,{id:1,role:'user'}),e=>e.status===404&&e.code==='NOT_FOUND');
});
test('transiciones inválidas no modifican estado',async()=>{
 let updates=0;
 const service=createApplicationService({transaction:fn=>fn({query:async sql=>{
   if(sql.startsWith('SELECT status'))return {rows:[{status:'RECHAZADA'}]};
   updates++;return {rows:[]};
 }})});
 await assert.rejects(()=>service.changeStatus({id:2,status:'APROBADA',reason:'',actorId:1}),e=>e.status===409);
 assert.equal(updates,0);
});
test('crear postulación registra evento en la misma transacción',async()=>{
 const queries=[];
 const service=createApplicationService({transaction:fn=>fn({query:async(sql,params)=>{
   queries.push({sql,params});
   if(sql.startsWith('SELECT'))return {rowCount:1};
   if(sql.startsWith('INSERT INTO applications'))return {rows:[{id:17}]};
   return {rowCount:1};
 }})});
 assert.deepEqual(await service.create({animalId:2,userId:4,motivation:'Hogar adecuado'}),{id:17,animalId:2,estado:'PENDIENTE'});
 assert.equal(queries.length,3);
});
