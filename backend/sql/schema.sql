-- Modelo relacional PatitasGo EP2. PostgreSQL 14+.
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL CHECK (char_length(trim(full_name)) >= 2),
  email VARCHAR(254) NOT NULL UNIQUE CHECK (email = lower(email)),
  password_hash VARCHAR(200) NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
CREATE TABLE IF NOT EXISTS animals (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL CHECK (length(trim(name)) > 0),
  species VARCHAR(10) NOT NULL CHECK (species IN ('PERRO','GATO')),
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('MACHO','HEMBRA')),
  age_text VARCHAR(60) NOT NULL,
  size VARCHAR(10) NOT NULL CHECK (size IN ('PEQUEÑO','MEDIANO','GRANDE')),
  status VARCHAR(12) NOT NULL DEFAULT 'BORRADOR' CHECK (status IN ('BORRADOR','DISPONIBLE','RESERVADO','ADOPTADO','ARCHIVADO')),
  description TEXT NOT NULL DEFAULT '',
  shelter VARCHAR(120) NOT NULL DEFAULT 'PatitasGo',
  location VARCHAR(120) NOT NULL,
  distance_text VARCHAR(80) NOT NULL DEFAULT 'Distancia no disponible',
  health TEXT NOT NULL DEFAULT 'Sin información médica',
  image_url TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS animals_public_idx ON animals(status, species, size);
CREATE TABLE IF NOT EXISTS applications (
  id BIGSERIAL PRIMARY KEY,
  animal_id BIGINT NOT NULL REFERENCES animals(id) ON DELETE RESTRICT,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  motivation TEXT NOT NULL CHECK (char_length(trim(motivation)) >= 10),
  status VARCHAR(16) NOT NULL DEFAULT 'PENDIENTE' CHECK (status IN ('PENDIENTE','EN_REVISION','APROBADA','RECHAZADA')),
  review_reason TEXT,
  reviewed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(animal_id, user_id)
);
CREATE INDEX IF NOT EXISTS applications_user_idx ON applications(user_id);
CREATE TABLE IF NOT EXISTS application_events (
  id BIGSERIAL PRIMARY KEY,
  application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  actor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  from_status VARCHAR(16),
  to_status VARCHAR(16) NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
