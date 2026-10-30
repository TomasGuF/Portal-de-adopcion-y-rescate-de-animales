import 'dotenv/config';
import bcrypt from 'bcrypt';
import { db } from './db.mjs';
import { validEmail, validName, validPassword } from './validation.mjs';
const email = (process.env.ADMIN_EMAIL ?? '').toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD ?? '';
const name = process.env.ADMIN_NAME ?? 'Administrador';
if (!validEmail(email) || !validName(name) || !validPassword(password)) {
  console.error('Configura ADMIN_EMAIL, ADMIN_NAME y ADMIN_PASSWORD fuerte en .env');
  process.exit(1);
}
try {
  const hash = await bcrypt.hash(password, 12);
  const { rowCount } = await db.query("INSERT INTO users(full_name,email,password_hash,role) VALUES($1,$2,$3,'admin') ON CONFLICT(email) DO NOTHING", [name,email,hash]);
  console.log(rowCount ? 'Administrador creado' : 'La dirección ya tiene una cuenta; no se elevó su rol');
} finally { await db.end(); }
