import { db } from './db.mjs';
const animals = [
  ['Milo','GATO','MACHO','2 años','MEDIANO','Valparaíso','Huellas Felices','Compañero sociable que busca un hogar estable.', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800'],
  ['Luna','GATO','HEMBRA','4 años','MEDIANO','Viña del Mar','Refugio Patitas','Gata curiosa y juguetona.', 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800'],
  ['Rocky','PERRO','MACHO','1 año','GRANDE','Limache','Amigos Peludos','Perro activo para una familia que disfrute pasear.', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800']
];
try {
  for (const a of animals) await db.query(`INSERT INTO animals(name,species,gender,age_text,size,location,shelter,description,image_url,status)
    SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,'DISPONIBLE'
    WHERE NOT EXISTS (SELECT 1 FROM animals WHERE name=$1 AND shelter=$7)`,a);
  console.log('Datos de prueba cargados');
} finally { await db.end(); }
