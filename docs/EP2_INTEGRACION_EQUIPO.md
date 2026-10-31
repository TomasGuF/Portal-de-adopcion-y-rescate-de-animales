# Integración del equipo — decisión técnica EP2

Repositorios: `TomasGuF/Portal-de-adopcion-y-rescate-de-animales` (fork) y `Panchiky/Portal-de-adopcion-y-rescate-de-animales` (equipo).

## Hallazgos

Ambas implementaciones tienen valor, pero **no son compatibles copiando archivos**:

| Aspecto | Nuestra versión | Versión del equipo |
|---|---|---|
| Registro | `POST /api/auth/register`; `name,email,password` | `POST /api/auth/registro`; `nombre,apellido,email,password` |
| Respuesta login | `{data:{token,user}}` | `{ok:true,data:{token,usuario}}` |
| Roles | `user/admin` | `USUARIO/ADMIN` |
| Catálogo | `GET /api/animals` | `GET /api/animales` |
| Postulaciones | `GET /api/applications` | `GET /api/postulaciones/mias` |
| Persistencia | 5 tablas en inglés | 10 tablas en español con refugios, favoritos, citas y apadrinamientos |
| Pruebas | Integración backend + Cypress en CI | No se localizó suite equivalente en rama backend |

La versión del equipo separa controladores y servicios en más módulos y tiene protecciones de seguridad como Helmet y rate limiting. Nuestra versión presenta integración frontend/API y pruebas automatizadas confirmadas.

**Riesgo crítico:** `database/schema.sql` en la rama `backend` del equipo utiliza `DROP TABLE IF EXISTS`. Ejecutarlo sobre una BD con datos causaría pérdida de registros.

## Decisión sugerida (pendiente de acuerdo del equipo)

Usar nuestra versión integrada como **candidata para EP2**, sin declarar eliminado ni sustituido el trabajo del equipo. Conservar la rama `backend` como referencia. Portar luego mejoras específicas: modelo de refugios, favoritos persistentes, Helmet y rate limiting, sujetas a pruebas.

## Plan sin pérdida de datos

1. Congelar la versión EP2 en el fork, con tests verdes.
2. Respaldar base de datos antes de cualquier migración: nunca ejecutar scripts con `DROP TABLE` sobre datos reales.
3. Acordar contrato API y modelo relacional único (nombres de campos, estados y roles).
4. Crear PR **en borrador** hacia el repositorio del equipo para revisar las diferencias.
5. Revisar PR en equipo, adaptar Axios o Fetch y las rutas si corresponde, y ejecutar CI.
6. Fusionar solo después de aprobar pruebas de usuario y administrador, y verificar que ningún dato se pierda.

No eliminar ramas de otros colaboradores. Una rama de Git no debe confundirse con el historial ni los datos de PostgreSQL.
