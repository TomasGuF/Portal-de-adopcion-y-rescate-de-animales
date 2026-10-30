export const validEmail = (email) => typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validPassword = (password) => typeof password === 'string' && password.length >= 8 && password.length <= 72 && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
export const validName = (name) => typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 120;
export const idValue = (value) => /^\d+$/.test(String(value)) && Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : null;
export const enums = {
  species: ['PERRO', 'GATO'], gender: ['MACHO','HEMBRA'], size: ['PEQUEÑO','MEDIANO','GRANDE'],
  status: ['BORRADOR','DISPONIBLE','RESERVADO','ADOPTADO','ARCHIVADO'],
  applicationStatus: ['PENDIENTE','EN_REVISION','APROBADA','RECHAZADA']
};
export function validateAnimal(body, { partial = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Cuerpo JSON inválido';
  const required = ['name','species','gender','age','size','location'];
  if (!partial && required.some((key) => body[key] === undefined)) return 'Faltan campos obligatorios';
  for (const key of ['name','age','location','description','shelter','health','image']) {
    if (body[key] !== undefined && (typeof body[key] !== 'string' || body[key].length > (key === 'description' || key === 'health' ? 3000 : 500))) return `Campo ${key} inválido`;
  }
  for (const key of ['name','age','location']) if (body[key] !== undefined && !body[key].trim()) return `Campo ${key} obligatorio`;
  for (const key of ['species','gender','size','status']) if (body[key] !== undefined && !enums[key].includes(body[key])) return `Campo ${key} inválido`;
  if (body.tags !== undefined && (!Array.isArray(body.tags) || body.tags.length > 15 || body.tags.some((x) => typeof x !== 'string' || x.length > 50))) return 'Etiquetas inválidas';
  if (body.status === 'DISPONIBLE' && (!body.image || !body.image.trim()) && !partial) return 'Se requiere imagen para publicar';
  return null;
}
