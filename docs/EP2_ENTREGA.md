# PatitasGo — Entrega Parcial 2

Versión: `refactor/ep2-arquitectura-capas`. Este documento describe **nuestra implementación**; no la rama `backend` independiente del repositorio del equipo.

## Cumplimiento

| EP | Implementación / evidencia | Estado |
|---|---|---|
| 2.1 Servidor | `backend/src/app.mjs`, `backend/src/server.mjs` — Express 3001 | Implementado |
| 2.2 Datos relacionales | `backend/sql/schema.sql`; diagrama en [EP2_MODELO_RELACIONAL.md](EP2_MODELO_RELACIONAL.md) | Implementado |
| 2.3 REST | GET, POST, PATCH y DELETE lógico; códigos HTTP y `{data}` / `{error}` | Implementado |
| 2.4 Integración | `src/services/apiClient.ts` y `ep2Service.ts`: Fetch, JWT, manejo de errores; proxy Vite | Implementado |
| 2.5 JWT | Registro, inicio/cierre de sesión, rutas protegidas, control de acceso por roles | Implementado |
| 2.6 Seguridad | bcrypt, validación, secreto en `.env`, consultas parametrizadas, sesiones revocables | Implementado para el alcance EP2 |
| 2.7 Pruebas | Test unitarios/integración + Cypress + colección Postman | CI aprobada; **capturas manuales pendientes** |

## Arquitectura

```text
Ionic + React (Vista)
  → apiClient (HTTP + token)
    → Express Router (Controller + autorización)
      → Service (reglas de negocio)
        → Repository (SQL + transacción)
          → PostgreSQL
```

La separación Router/Service/Repository/Mapper se aplicó **a postulaciones**, no aún a todos los módulos. [Arquitectura detallada](ARQUITECTURA.md).

## Endpoints

| Método | Ruta | Permiso |
|---|---|---|
| GET | /api/health | Público |
| POST | /api/auth/register | Público |
| POST | /api/auth/login | Público |
| GET | /api/auth/me | Autenticado |
| POST | /api/auth/logout | Autenticado |
| GET | /api/animals | Público |
| GET | /api/animals/:id | Público |
| GET | /api/admin/animals | Admin |
| POST | /api/animals | Admin |
| PATCH | /api/animals/:id | Admin |
| DELETE | /api/animals/:id | Admin, archivado lógico |
| POST | /api/applications | Usuario |
| GET | /api/applications | Autenticado: ámbito restringido según rol |
| GET | /api/applications/:id | Autenticado: acceso autorizado |
| PATCH | /api/applications/:id/status | Admin |
| GET | /api/notifications | Usuario |

## Instrucciones Codespaces

En la raíz del proyecto, por primera vez: `npm ci`, `docker compose up -d`.

En `backend/`: `npm install`; configurar `.env` desde `.env.example` **sin publicar secretos**; `npm run db:migrate` y `npm run db:seed` para crear estructura y animales de ejemplo. Luego `npm run dev` (puerto 3001).

En otra terminal, raíz: `npm run dev -- --host 0.0.0.0 --port 5173 --strictPort`. Abrir desde Ports 5173 y probar `curl http://localhost:5173/api/health`.

`db:seed` no crea usuarios. No ejecutar `docker compose down -v`: elimina el volumen con datos.

## Evidencias y entrega

- [Pruebas y evidencias](EP2_PRUEBAS_EVIDENCIAS.md).
- [Modelo relacional](EP2_MODELO_RELACIONAL.md).
- Colección: `backend/postman/PatitasGo-EP2.postman_collection.json`.
- Frontend + navegador: https://github.com/TomasGuF/Portal-de-adopcion-y-rescate-de-animales/actions/runs/41160674458
- Backend con PostgreSQL: https://github.com/TomasGuF/Portal-de-adopcion-y-rescate-de-animales/actions/runs/41160674443

No se presentan capturas de Postman como si ya hubieran sido ejecutadas. Falta registrar evidencias manuales del entorno de entrega y acordar con el equipo qué backend será el oficial.
