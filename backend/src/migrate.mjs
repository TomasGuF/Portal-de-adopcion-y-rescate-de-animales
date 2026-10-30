import { readFile } from 'node:fs/promises';
import { db } from './db.mjs';
const sql = await readFile(new URL('../sql/schema.sql', import.meta.url), 'utf8');
try { await db.query(sql); console.log('Esquema PostgreSQL listo'); }
finally { await db.end(); }
