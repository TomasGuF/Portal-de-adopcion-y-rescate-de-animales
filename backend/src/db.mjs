import 'dotenv/config';
import pg from 'pg';

if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL en el entorno');
export const db = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 10, connectionTimeoutMillis: 5000 });
db.on('error', (error) => console.error('Error en pool PostgreSQL:', error.message));
export const query = (sql, params = []) => db.query(sql, params);
