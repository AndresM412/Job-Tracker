# Job Tracker — Contexto para agentes de IA

## Sobre el proyecto

Job Tracker es una app full-stack de seguimiento de postulaciones laborales.

- Frontend: React + TypeScript + Vite + Tailwind CSS v4
- Backend: FastAPI (Python) + SQLAlchemy + PostgreSQL (en Docker)
- Autenticación: JWT (python-jose), contraseñas con bcrypt (fijado a 4.0.1
  por incompatibilidad con passlib 1.7.4)
- Testing: Playwright (E2E), CI en GitHub Actions
- Entorno local: venv en `backend/venv`, PostgreSQL vía `docker-compose.yml`
  en la raíz

## Objetivo personal — MUY IMPORTANTE

Estoy usando este proyecto para aprender profundamente React, TypeScript,
Python y Playwright, con el objetivo de conseguir trabajo como QA
Automation Engineer. El aprendizaje real es más importante que la
velocidad de entrega.

## Cómo quiero que trabajes conmigo

- **No me des código completo de entrada.** Cuando la tarea involucre un
  concepto nuevo para mí, explica el concepto primero (con analogías si
  ayuda) y hazme preguntas guía para que yo intente resolverlo antes de
  darme la solución.
- **En piezas mecánicas o repetitivas** que ya domino (patrones que ya
  usé antes en este proyecto), puedes darme el código directo sin
  preguntas, para no hacerme perder tiempo en algo que ya sé.
- **Explica el "por qué", no solo el "qué".** Si tomas una decisión de
  diseño (por ejemplo, por qué un schema no hereda de otro), explica el
  razonamiento, especialmente si es una decisión de seguridad.
- **Usa Planning Mode como default** para tareas que no sean triviales —
  quiero ver el plan antes de que se apliquen cambios.
- **Cuando algo falle (tests, CI, errores en runtime), no asumas la
  causa.** Pide el log/traceback completo antes de proponer un fix, y
  explica la causa raíz real, no solo el parche.
- **Al finalizar una tarea significativa**, propón una actualización a
  la sección "Estado actual" de este mismo archivo, pero no la apliques
  sin que yo la confirme primero.

## Convenciones del proyecto

- Commits siguen Conventional Commits (`tipo(scope): resumen`), con
  cuerpo explicando el qué y el porqué. Nunca describir en un commit
  algo que no se implementó realmente.
- Cambios en dependencias de Python u otras herramientas deben reflejarse
  siempre en `requirements.txt` (`pip freeze > requirements.txt`) antes
  de hacer commit, para no romper CI.
- **Nomenclatura y arquitectura frontend (Feature-based)**:
  - **Carpetas por Dominio**: Componentes agrupados por dominio de negocio (`landing/`, `auth/`, `dashboard/`, `applications/`, `ui/`, `placeholders/`). Los subcomponentes de una vista específica se agrupan en subcarpetas en kebab-case (ej. `applications/job-detail/`).
  - **Sufijo `*View.tsx` para Vistas**: Toda pantalla o vista completa lleva el sufijo `View.tsx` (ej. `LandingView.tsx`, `AuthView.tsx`, `DashboardView.tsx`, `JobDetailView.tsx`, `JobFormView.tsx`, `CalendarPlaceholderView.tsx`, `TargetHubPlaceholderView.tsx`).
  - **Sufijo `*Modal.tsx` para Modales**: Todo diálogo o ventana modal lleva el sufijo `Modal.tsx` (ej. `NoteModal.tsx`, `JobDescriptionModal.tsx`, `ConfirmDeleteNoteModal.tsx`, `OfficeMapModal.tsx`, `ConfirmDeleteModal.tsx`).
  - **State Colocation**: El estado exclusivo de una sección (como paginación o búsqueda local de notas) vive dentro de su propio subcomponente para blindar el orquestador contra re-renders innecesarios.

## Estado actual

Skills instaladas (.agents/skills/):

- frontend-design: guía de diseño visual distintivo (layout, tipografía, paleta de colores y motion) para evitar interfaces genéricas en React/Tailwind.
- explain-code: explicación pedagógica bajo demanda de código existente con ejemplos, flujo paso a paso y pregunta de comprensión (MoureDev).

Backend: registro y login con JWT funcionando. Todos los endpoints de /jobs (GET, POST, PUT, DELETE, PATCH) protegidos con autenticación JWT y filtrados por el user_id del usuario autenticado. Soporte completo para campos adicionales de la vacante (`job_url`, `priority`, `location`, `work_mode`, `office_address`, `office_lat`, `office_lng`) con validación estricta contra XSS y sanitización de dominios en Pydantic (`schemas.py`), migración idempotente `_ensure_extra_job_columns` y endpoints PATCH/PUT actualizados. Endpoint seguro `DELETE /users/me` para auto-eliminación de cuentas con borrado en cascada (Cascade Delete) en SQLAlchemy (`cascade="all, delete-orphan"`, `ForeignKey(..., ondelete="CASCADE")`) que purga en efecto dominó todas las postulaciones y notas del usuario. Script utilitario `backend/scripts/clean_test_users.py` (`npm run test:clean`) para purgar usuarios de prueba huérfanos en PostgreSQL. Suite de Pytest con 20 tests cubriendo auth, auto-eliminación, aislamiento multi-tenancy, notas modulares y CRUD de vacantes.

Frontend: Arquitectura organizada por dominios de negocio (Feature-based: auth/, landing/, dashboard/, applications/ con filters/, placeholders/ y ui/). Landing Page modular en inglés organizada en 3 pestañas interactivas (Overview, Live Sandbox con dot animado, y How It Works de 4 pasos). Navegación sincronizada con el historial nativo del navegador (pushState, popstate, rutas /login y /register, y soporte para la flecha Atrás). Pantallas de Login y Registro (AuthView) rediseñadas con pestañas dedicadas (tab-login/tab-register), botón interactivo para mostrar/ocultar contraseñas, animación fluida en CSS Grid y etiquetas accesibles asociadas (htmlFor/id). Vista autenticada con diseño moderno "Command Center" (Material 3 Dark Slate), barra lateral izquierda (Sidebar) colapsable con transición fluida a 200ms ease-out (`transition-[width]`), alineación simétrica de botones en modo colapsado, y revelado de texto sin saltos visuales (`whitespace-nowrap overflow-hidden`). Vista ejecutiva DashboardView con resumen de telemetría y vacantes recientes. Componente SalaryRangeInput con popover interactivo multidivisa (USD, EUR, COP) y validación de tope numérico (999,999,999). Selector interactivo de estrellas de prioridad `StarRating` en Cards y Tabla (estático en Ficha Técnica). Modal de geolocalización y mapa interactivo con Leaflet (`OfficeMapModal` y `LeafletMapCanvas`) para fijar y visualizar coordenadas y dirección de la oficina. Filtros de prioridad (`PriorityDropdown`) y ubicación (`LocationFilterDropdown`) en la barra de herramientas de Applications. Descomposición arquitectónica de `JobDetailView` en subcomponentes modulares de dominio (`job-detail/`: `JobDetailHeader`, `JobDetailOverview`, `JobDescriptionCard`, `JobNotesSection`). Estandarización de nomenclaturas con sufijos semánticos `*View.tsx` (`AuthView.tsx`, `LandingView.tsx`, `CalendarPlaceholderView.tsx`, `TargetHubPlaceholderView.tsx`) y `*Modal.tsx` (`OfficeMapModal.tsx`), con eliminación de archivos obsoletos y State Colocation para aislamiento de re-renders. Resplandor luminoso unificado en botones de acción y efectos hover sincronizados. Skeletons animados de carga inicial (`animate-pulse`) en Cards y Tabla consistentes tanto con sidebar colapsado como expandido. Estabilidad visual anti-salto en la sección de notas fijando altura mínima de cuadrícula a 385px (`min-h-[385px] content-start`).

Ficha Técnica y Modales Unificados (JobDetailView): Componentes de diálogo unificados con conmutación in-situ fluida entre modo lectura y modo edición (`NoteModal.tsx` y `JobDescriptionModal.tsx`) sin aperturas de ventanas secundarias. Estandarización geométrica completa (`max-w-xl`), botones simétricos de acción (`h-9 px-4 rounded-lg`), cabeceras gemelas con badges de estado (`Details` vs `Editing`). Tarjeta de Job Description compacta con disparador `Read more` condicional (activado únicamente para textos largos) y botón `Update`. Sección de Notes con cuadrícula de 2 columnas, buscador dinámico por título, paginación numérica fija sin saltos de scroll, y botón `Add Note` en cabecera activo solo cuando existen notas (con `Add First Note` en el estado vacío). Optimización de rendimiento gráfico de scroll a 60 FPS mediante eliminación de `backdrop-blur`, bloqueo de scroll en el `body` (`overflow: hidden`), aislamiento con `overscroll-contain` y promoción de capa en GPU (`transform-gpu`).

Vista Applications (Command Center): Toolbar unificada en una sola fila con buscador flexible, menú desplegable StatusDropdown (con conteo por estado y selector all/applied/interview/offer/rejected), popover de calendario mensual interactivo DateRangeDropdown (con selección visual de rango en dos clics sin escribir texto y presets rápidos), botón de ordenamiento con opción por defecto "Recently added" (LIFO) y filtros por fecha de postulación ("Application date: Newest / Oldest"), y selector de vistas (Cards vs. Table) persistido en localStorage. Modo Cards con lote inicial de 6 elementos, skeletons animados de carga inicial y scroll infinito hacia abajo con skeleton loading. Modo Table estructurado según el mockup (JobTable) con diseño adaptable, anchos proporcionales blindados contra textos largos, tooltips nativos, scrollbars oscuras discretas y paginación numérica inferior (Pagination) de 6 elementos por página con botones de navegación y botón central "Load More".

Tests: Suite de Playwright estructurada en suites por dominio (tests/auth/, tests/landing/, tests/applications/), permitiendo ejecución granular por carpetas en CI/CD y manteniendo el Page Object Model en tests/pages/ y helpers en tests/helpers.ts. Scripts optimizados en `package.json` para feedback ultra-rápido en local (`npm run test:e2e`, `test:e2e:ui`, `test:e2e:all`) y comando de purga de base de datos (`npm run test:clean`). Hook `afterEach` con helper API `deleteUserByCredentials` en `auth.spec.ts` para garantizar auto-limpieza instantánea de usuarios temporales vía HTTP en milisegundos, previniendo acumulación de datos en PostgreSQL. Suite dedicada `tests/applications/job-extra-fields.spec.ts` validando el ciclo de vida completo de campos adicionales, estrellas, mapa de Leaflet y filtros. Suite dedicada `tests/applications/modular-notes.spec.ts` para notas modulares, validaciones in-situ de modales y persistencia en backend.

## Próxima sesión (Prioridad inmediata acordada)

1. **Timeline de Etapas con Fechas**:
   - Modelar el historial de fechas de cada etapa para registrar cuándo ocurrió la postulación (`Applied`), cuándo se agendó la entrevista (`Interview`), la oferta (`Offer`) o el cierre (`Rejected`), visualizándolo en el componente cronológico tipo timeline del mockup.

2. **Recordatorio a usuario**:
   - Notificaciones que le recuerden al usuario que no se ha postulado el dia de hoy y que reciba notificaciones por correo.

## Próximos pasos acordados (Roadmap en desarrollo)

1. **Selector de Vista en Applications (Grid vs. Table)** [COMPLETADO]:
   - Switch en la barra de herramientas para alternar entre tarjetas y tabla estructurada con paginación numérica de 6 elementos, scroll infinito en tarjetas y toolbar unificada en una sola fila con dropdowns de estado y calendario visual de rango de fechas.

2. **Ordenamiento por defecto (Más recientes primero)** [COMPLETADO]:
   - Configurar la lista para que por defecto muestre las postulaciones más recientemente agregadas en la parte superior (LIFO), manteniendo la opción de que el usuario ordene por fecha de postulación u otros criterios si lo prefiere.

3. **Ventana Unificada de Creación y Detalle (Master-Detail)** [COMPLETADO]:
   - Reemplazar el formulario modal flotante por la vista a pantalla completa `JobFormView` inspirada en `specific_detail_application_view`.
   - Al hacer clic en una tarjeta/fila: abre la ficha técnica detallada `JobDetailView` con confirmación modal para eliminación.
   - Al hacer clic en "+ Add Application": abre esa misma ficha en modo creación a pantalla completa en blanco para ingresar la información.

4. **Notas Modulares con Título y Job Description** [COMPLETADO]:
   - Evolucionar las notas a una colección de cajones independientes con título, contenido y fecha de registro.
   - Modales interactivos unificados con conmutación in-situ de lectura/edición para notas y descripción de vacante, diseño geométrico estandarizado y scroll a 60 FPS acelerado por GPU.

5. **Campos Adicionales de la Vacante (Link Directo de la vacante, Prioridad, Ubicacion y Mapa)** [COMPLETADO]:
   - Incorporar campo opcional para la URL directa de la vacante (`job_url`).
   - Incorporar campo de Prioridad de la vacante, por medio de iconos de 5 estrellas (interactivas en Cards y Tabla, estáticas en Detalle).
   - Incorporar campo de ubicación y modalidad de trabajo (Remote, On-site, Hybrid).
   - Incorporar modal de mapa interactivo con Leaflet (`OfficeMapModal`) para geolocalizar y fijar coordenadas de la oficina.
   - Descomposición de `JobDetailView` en subcomponentes por dominio (`job-detail/`) y estandarización de nombres (`*View.tsx`, `*Modal.tsx`).

6. **Timeline de Etapas con Fechas**:
   - Modelar el historial de fechas de cada etapa para registrar cuándo ocurrió la postulación (`Applied`), cuándo se agendó la entrevista (`Interview`), la oferta (`Offer`) o el cierre (`Rejected`), visualizándolo en el componente cronológico tipo timeline del mockup.

7. **Recordatorio a usuario**:
   - Notificaciones que le recuerden al usuario que no se ha postulado el dia de hoy y que reciba notificaciones por correo
