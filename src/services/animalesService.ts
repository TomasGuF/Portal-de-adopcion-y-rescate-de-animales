export interface Animal {
  id: number;
  name: string;
  species: string;
  gender: string;
  age: string;
  size: string;
  status: 'BORRADOR' | 'DISPONIBLE' | 'RESERVADO' | 'ADOPTADO' | 'ARCHIVADO';
  tags: string[];
  description: string;
  shelter: string;
  location: string;
  distance: string;
  health: string;
  image: string;
}

const ANIMALES: Animal[] = [
  {
    id: 1,
    name: 'Milo',
    species: 'Gato mestizo',
    gender: 'Macho',
    age: '2 años',
    size: 'Mediano',
    status: 'DISPONIBLE',
    tags: ['Sociable', 'Tranquilo', 'Energía media'],
    description: 'Compañero sociable que disfruta las siestas al sol y busca un hogar estable y amoroso.',
    shelter: 'Huellas Felices',
    location: 'Valparaíso',
    distance: 'a 14 km',
    health: 'Salud: vacunas, desparasitación y esterilización al día.',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    name: 'Luna',
    species: 'Gato naranja',
    gender: 'Hembra',
    age: '4 años',
    size: 'Mediano',
    status: 'DISPONIBLE',
    tags: ['Juguetona', 'Cariñosa', 'Curiosa'],
    description: 'Una gata llena de energía que adora jugar con juguetes colgantes y recibir mimos en la barbilla.',
    shelter: 'Refugio Patitas',
    location: 'Viña del Mar',
    distance: 'a 18 km',
    health: 'Salud: esterilizada, vacunas al día y test negativo.',
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    name: 'Rocky',
    species: 'Perro mestizo',
    gender: 'Macho',
    age: '1 año',
    size: 'Grande',
    status: 'DISPONIBLE',
    tags: ['Muy activo', 'Fiel', 'Protector'],
    description: 'Rocky es un cachorro grande con mucha energía, ideal para personas activas que disfruten salir a correr.',
    shelter: 'Amigos Peludos',
    location: 'Limache',
    distance: 'a 5 km',
    health: 'Salud: vacunado y desparasitado.',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

export const obtenerAnimales = () => ANIMALES;

export const obtenerAnimal = (id: number) => ANIMALES.find((a) => a.id === id);

// Favoritos persistidos por cuenta, evitando mezclar usuarios en el mismo navegador.
const favoritosKey = () => {
  try {
    const raw = sessionStorage.getItem('patitasgo.user');
    const user = raw ? JSON.parse(raw) as {id?:number} : null;
    return `patitasgo.favoritos.${user?.id ?? 'invitado'}`;
  } catch { return 'patitasgo.favoritos.invitado'; }
};
export const obtenerFavoritos = (): number[] => {
  try {
    const values:unknown = JSON.parse(localStorage.getItem(favoritosKey()) ?? '[]');
    return Array.isArray(values) ? values.filter((n): n is number => Number.isSafeInteger(n) && n > 0) : [];
  } catch { return []; }
};

export const esFavorito = (id: number) => obtenerFavoritos().includes(id);

export const alternarFavorito = (id: number): boolean => {
  const favoritos = obtenerFavoritos();
  const agregado = !favoritos.includes(id);
  const nuevos = agregado ? [...favoritos, id] : favoritos.filter((f) => f !== id);
  localStorage.setItem(favoritosKey(), JSON.stringify(nuevos));
  window.dispatchEvent(new Event('patitasgo:favoritos-changed'));
  return agregado;
};
