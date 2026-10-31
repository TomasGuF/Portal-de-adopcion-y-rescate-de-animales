# Arquitectura incremental de PatitasGo

## Objetivo
Reducir acoplamiento sin cambiar rutas, respuestas JSON, JWT, esquema PostgreSQL ni pantallas existentes. Esta refactorización **no** garantiza que Codespaces nunca se suspenda: el ciclo de vida del servidor es independiente del diseño de software.

## Capas del backend
- **Router/controlador HTTP**: recibe solicitudes, valida entradas y aplica autenticación/autorización. `backend/src/modules/applications/application.router.mjs`.
- **Servicio / casos de uso**: decide reglas de negocio y transiciones de estado, sin depender de Express. `application.service.mjs`.
- **Repositorio**: consultas SQL parametrizadas, control de transacciones y aislamiento por usuario. `application.repository.mjs`.
- **Mapper / DTO**: traduce nombres de PostgreSQL al contrato público de la API. `application.mapper.mjs`.
- **Persistencia**: PostgreSQL a través del pool central `backend/src/db.mjs`.

Flujo: **React → apiClient → ruta Express → caso de uso → repositorio → PostgreSQL**. La respuesta regresa en orden inverso.

## Principios aplicados
- **SRP**: una responsabilidad principal por módulo.
- **DIP**: el servicio recibe un repositorio inyectable, simplificando pruebas unitarias.
- **OCP pragmático**: reglas de casos de uso pueden evolucionar sin modificar controladores o SQL directamente.
- **DRY**: centralización de DTOs y errores de dominio; evitar duplicación de SQL.
- **KISS/YAGNI**: no se introduce ORM, contenedores IoC ni microservicios en una entrega universitaria.
- **Seguridad**: el backend conserva la autorización por rol y usuario, consultas parametrizadas y transacciones.
- **Compatibilidad**: endpoints originales y forma de respuestas sin cambios; sin migración destructiva.

## Otras áreas pendientes
Los módulos de autenticación y animales todavía están en `backend/src/app.mjs`; separarlos exige sus propias pruebas de contrato antes de continuar. El frontend sigue usando páginas Ionic y servicios de acceso a API; conviene extraer hooks de consulta paulatinamente y mantener el menú persistente aislado del enrutamiento.

## Desarrollo y validación
Desde la raíz: `npm ci && npm run build`.
En `backend/`: `npm install && npm test` (las pruebas de integración requieren `TEST_DATABASE_URL`).
Los tests unitarios de servicio no requieren PostgreSQL.
El Codespace necesita tres procesos: PostgreSQL (Docker), API Express y Vite. `npm run build` no inicia ninguno.

## Política de integración
Esta rama es un cambio aislado. Fusionar únicamente tras revisión del equipo, pruebas de backend y frontend y comprobación manual de las pantallas de adopción, postulaciones y administración.
