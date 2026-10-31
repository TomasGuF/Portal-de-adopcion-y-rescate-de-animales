# EP2.7 — Pruebas y evidencias

## Pruebas automatizadas verificadas

| Prueba | Resultado |
|---|---|
| Compilación TypeScript/Vite | Aprobada (CI frontend) |
| Cypress: acceso protegido, listado, detalle, error recuperable | Aprobada (CI frontend, API simulada) |
| PostgreSQL: creación de tablas y seed repetible | Aprobada (CI backend) |
| Backend: registro, JWT, permisos, validaciones y postulaciones | Aprobada (CI backend) |

Resultados verificables:
- [CI frontend + Cypress](https://github.com/TomasGuF/Portal-de-adopcion-y-rescate-de-animales/actions/runs/41160674458)
- [CI backend](https://github.com/TomasGuF/Portal-de-adopcion-y-rescate-de-animales/actions/runs/41160674443)

**Limitación:** Cypress usa respuestas interceptadas y no equivale a una prueba extremo a extremo con la base de datos real.

## Colección Postman

Importar `backend/postman/PatitasGo-EP2.postman_collection.json` y definir `baseUrl = http://localhost:3001`. Iniciar sesión para que la colección guarde el JWT de prueba. Para casos administrativos, iniciar sesión con cuenta admin antes de ejecutar sus requests. Ajustar los IDs de ejemplo a los existentes. No probar DELETE sobre animales que deban conservarse.

## Matriz manual — evidencias aún no proporcionadas

| Caso | Resultado esperado | Evidencia |
|---|---|---|
| GET /api/health | 200, `data.status=ok` | Pendiente captura |
| Registro válido / inválido | 201 / 400 | Pendiente captura |
| Login válido / incorrecto | 200 + JWT / 401 | Pendiente captura |
| GET /api/auth/me sin token | 401 | Pendiente captura |
| Usuario ejecuta acción admin | 403 | Pendiente captura |
| Catálogo filtrado | 200 con JSON | Pendiente captura |
| Admin crea, modifica, archiva animal de prueba | 201 / 200 / 204 | Pendiente captura |
| Usuario crea postulación | 201, PENDIENTE | Pendiente captura |
| Usuario ve solo sus postulaciones | 200, listado propio | Pendiente captura |
| Otro usuario solicita postulación ajena | 404 | Pendiente captura |
| Admin cambia estado y consulta historial | 200 | Pendiente captura |
| Transición inválida de estado | 409 | Pendiente captura |
| Navegar al listado y detalle de Postulaciones | Pantallas visibles sin error | Pendiente captura |
| Logout e intento de reutilizar token | 204 y posteriormente 401 | Pendiente captura |

Las capturas deben mostrar método, URL, código HTTP, cuerpo JSON y Tests de Postman, **sin contraseñas, JWT ni datos personales reales**.

## Criterios de cierre

EP2 debe acompañarse de diagramas, colección Postman, pruebas reales ejecutadas en la instalación oficial, referencia al commit entregado y revisión del equipo. El estado «Pendiente captura» es deliberado: no se fabricaron evidencias.
