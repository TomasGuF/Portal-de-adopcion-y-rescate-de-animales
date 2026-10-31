import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validEmail, validName, validPassword, validateAnimal, idValue } from '../src/validation.mjs';

test('no acepta campos de registro inválidos',()=>{
  assert.equal(validEmail('correo-mal'),false);
  assert.equal(validName(' '),false);
  assert.equal(validPassword('password'),false);
  assert.equal(validPassword('Password123!'),true);
});
test('valida integridad del animal antes del INSERT',()=>{
  const body={name:'Milo',species:'GATO',gender:'MACHO',age:'2 años',size:'MEDIANO',location:'Viña del Mar'};
  assert.equal(validateAnimal(body),null);
  assert.match(validateAnimal({...body,species:'TIGRE'}),/species/);
  assert.match(validateAnimal({...body,status:'DISPONIBLE'}),/imagen/);
  assert.equal(idValue('1 OR 1=1'),null);
});
