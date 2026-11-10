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

## Estado actual

Skills instaladas (.agents/skills/):

- frontend-design: guía de diseño visual distintivo (layout, tipografía, paleta de colores y motion) para evitar interfaces genéricas en React/Tailwind.
- explain-code: explicación pedagógica bajo demanda de código existente con ejemplos, flujo paso a paso y pregunta de comprensión (MoureDev).

Backend: registro y login con JWT funcionando. Todos los endpoints de /jobs (GET, POST, PUT, DELETE) protegidos con autenticación JWT y filtrados por el user_id del usuario autenticado. Modelo SQLAlchemy y schemas Pydantic con soporte para salary, round (etapa de entrevista), description y created_at con zona horaria UTC. Modelo relacional `JobNote` (1:N) con endpoints CRUD dedicados `/jobs/{job_id}/notes`. Base de datos PostgreSQL en Docker sincronizada con migraciones de esquema. Ordenamiento nativo LIFO en backend (.order_by(models.JobApplication.created_at.desc())). Suite de pruebas backend con Pytest cubriendo auth, JWT, CRUD, aislamiento multi-tenancy, notas modulares y orden de creación LIFO.

Frontend: Arquitectura organizada por dominios de negocio (Feature-based: auth/, landing/, dashboard/, applications/ con filters/, placeholders/ y ui/). Landing Page modular en inglés organizada en 3 pestañas interactivas (Overview, Live Sandbox con dot animado, y How It Works de 4 pasos). Tab Overview con titular de propuesta de valor, sección de fricción con simulación auténtica de Google Sheets (7 campos de Job Tracker), hub de exploración con caminos de decisión y botones de acción rápida. Tab Live Sandbox con espacio de prueba interactivo (#demo), filtrado en tiempo real, búsqueda y ordenamiento de vacantes de muestra. Navegación sincronizada con el historial nativo del navegador (pushState, popstate, rutas /login y /register, y soporte para la flecha Atrás). Pantallas de Login y Registro (AuthForm) rediseñadas con pestañas dedicadas (tab-login/tab-register), botón interactivo para mostrar/ocultar contraseñas, animación fluida en CSS Grid y etiquetas accesibles asociadas (htmlFor/id). Vista autenticada con diseño moderno "Command Center" (Material 3 Dark Slate), barra lateral izquierda (Sidebar) fija con navegación fluida y colapsable en móviles, vista ejecutiva DashboardView con resumen de telemetría y vacantes recientes, componente SalaryRangeInput con popover interactivo multidivisa (USD, EUR, COP) y validación de tope numérico (999,999,999), selector de etapas de entrevista (round), dots de telemetría animados (animate-pulse), tarjetas con jerarquía semántica <h2> y notas con límite de 4000 caracteres. Reemplazo del formulario modal flotante (JobFormModal) por la vista unificada a pantalla completa JobFormView para crear y editar postulaciones (cabecera hero, layout en 4 secciones lógicas, selector de fecha híbrido teclado/picker nativo y botones de acción simétricos). Eliminación definitiva de código muerto (JobForm.tsx, JobModal.tsx, NavigationTabs.tsx, NoteDetailModal.tsx) y limpieza de estados residuales en App.tsx y JobItem.tsx. Integración del modal de confirmación ConfirmDeleteModal en JobDetailView antes de eliminar una vacante.

Ficha Técnica y Modales Unificados (JobDetailView): Componentes de diálogo unificados con conmutación in-situ fluida entre modo lectura y modo edición (`NoteModal.tsx` y `JobDescriptionModal.tsx`) sin aperturas de ventanas secundarias. Estandarización geométrica completa (`max-w-xl`), botones simétricos de acción (`h-9 px-4 rounded-lg`), cabeceras gemelas con badges de estado (`Details` vs `Editing`). Tarjeta de Job Description compacta con disparador `Read more` condicional (activado únicamente para textos largos) y botón `Update`. Sección de Notes con cuadrícula de 2 columnas, buscador dinámico por título, paginación numérica, y botón `Add Note` en cabecera activo solo cuando existen notas (con `Add First Note` en el estado vacío). Optimización de rendimiento gráfico de scroll a 60 FPS mediante eliminación de `backdrop-blur`, bloqueo de scroll en el `body` (`overflow: hidden`), aislamiento con `overscroll-contain` y promoción de capa en GPU (`transform-gpu`).

Vista Applications (Command Center): Toolbar unificada en una sola fila con buscador flexible, menú desplegable StatusDropdown (con conteo por estado y selector all/applied/interview/offer/rejected), popover de calendario mensual interactivo DateRangeDropdown (con selección visual de rango en dos clics sin escribir texto y presets rápidos), botón de ordenamiento con opción por defecto "Recently added" (LIFO) y filtros por fecha de postulación ("Application date: Newest / Oldest"), y selector de vistas (Cards vs. Table) persistido en localStorage. Modo Cards con lote inicial de 6 elementos y scroll infinito hacia abajo con skeleton loading animado. Modo Table estructurado según el mockup (JobTable) con diseño adaptable, anchos proporcionales blindados contra textos largos, tooltips nativos, scrollbars oscuras discretas y paginación numérica inferior (Pagination) de 6 elementos por página con botones de navegación y botón central "Load More".

Tests: suite de Playwright estructurada en suites por dominio (tests/auth/, tests/landing/, tests/applications/), permitiendo ejecución granular por carpetas en CI/CD y manteniendo el Page Object Model en tests/pages/ y helpers en tests/helpers.ts. Suite ampliada cubriendo flujos de autenticación, landing page modular, navegación global, filtros por status, búsqueda, ordenamiento LIFO y por fechas, alternancia Cards/Table, persistencia en localStorage, flujo completo de Master-Detail (creación a pantalla completa, cancelación, edición desde detalle y eliminación confirmada), y suite dedicada `tests/applications/modular-notes.spec.ts` para notas modulares, validaciones in-situ de modales y persistencia en backend.

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

5. **Campos Adicionales de la Vacante (Link Directo y Ubicación)** [SIGUIENTE PASO]:
   - Incorporar campo opcional para la URL directa de la vacante (`job_url`) y la ubicación (`location`) en base de datos, backend, formulario de creación y ficha de detalle.

6. **Timeline de Etapas con Fechas**:
   - Modelar el historial de fechas de cada etapa para registrar cuándo ocurrió la postulación (`Applied`), cuándo se agendó la entrevista (`Interview`), la oferta (`Offer`) o el cierre (`Rejected`), visualizándolo en el componente cronológico tipo timeline del mockup.

7. **Recordatorio a usuario**:
   - Notificaciones que le recuerden al usuario que no se ha postulado el dia de hoy y que reciba notificaciones por correo
