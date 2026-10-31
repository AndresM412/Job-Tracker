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

Backend: registro y login con JWT funcionando. Todos los endpoints de /jobs (GET, POST, PUT, DELETE) protegidos con autenticación JWT y filtrados por el user_id del usuario autenticado. Modelo SQLAlchemy y schemas Pydantic con soporte para salary y round (etapa de entrevista). Base de datos PostgreSQL sincronizada. Suite de pruebas backend con Pytest (8/8 pasadas en verde con SQLite en memoria) cubriendo auth, JWT, CRUD y aislamiento multi-tenancy.

Frontend: Landing Page moderna en inglés como vista inicial para visitantes no autenticados, con botones de Log In y Sign Up en la barra superior, espacio de prueba interactivo en vivo (#demo) con filtrado y ordenamiento en tiempo real, secciones de características y navegación sincronizada con el historial nativo del navegador (pushState, popstate, rutas /login y /register, y soporte para la flecha Atrás). Pantallas de Login y Registro (AuthForm) rediseñadas con pestañas dedicadas (tab-login/tab-register), botón interactivo para mostrar/ocultar contraseñas, animación fluida en CSS Grid y etiquetas accesibles asociadas (htmlFor/id). Vista autenticada con diseño moderno "Command Center" (Material 3 Dark Slate), barra lateral izquierda (Sidebar) fija con navegación fluida y colapsable en móviles, vista ejecutiva DashboardView con resumen de telemetría y vacantes recientes, componente SalaryRangeInput con popover interactivo multidivisa (USD, EUR, COP) y validación de tope numérico (999,999,999), selector de etapas de entrevista (round), dots de telemetría animados (animate-pulse), tarjetas con jerarquía semántica <h2> y notas con límite de 4000 caracteres.

Vista Applications (Command Center): Toolbar unificada en una sola fila con buscador flexible, menú desplegable StatusDropdown (con conteo por estado y selector all/applied/interview/offer/rejected), popover de calendario mensual interactivo DateRangeDropdown (con selección visual de rango en dos clics sin escribir texto y presets rápidos), botón de ordenamiento y selector de vistas (Cards vs. Table) persistido en localStorage. Modo Cards con lote inicial de 6 elementos y scroll infinito hacia abajo con skeleton loading animado. Modo Table estructurado según el mockup (JobTable) con diseño adaptable, anchos proporcionales blindados contra textos largos, tooltips nativos, scrollbars oscuras discretas y paginación numérica inferior (Pagination) de 6 elementos por página con botones de navegación y botón central "Load More".

Tests: suite de Playwright (33 tests E2E pasados en verde) y Pytest integrada en CI, con Page Object Model (POM) cubriendo flujos de autenticación, landing page, navegación global, filtros por status, búsqueda, ordenamiento, alternancia de vistas Cards/Table, persistencia en localStorage, y CRUD completo de vacantes.

## Próximos pasos acordados (Roadmap en desarrollo)

1. **Selector de Vista en Applications (Grid vs. Table)** [COMPLETADO]:
   - Switch en la barra de herramientas para alternar entre tarjetas y tabla estructurada con paginación numérica de 6 elementos, scroll infinito en tarjetas y toolbar unificada en una sola fila con dropdowns de estado y calendario visual de rango de fechas.

2. **Ordenamiento por defecto (Más recientes primero)**:
   - Configurar la lista para que por defecto muestre las postulaciones más recientemente agregadas en la parte superior (LIFO), manteniendo la opción de que el usuario ordene por fecha de postulación u otros criterios si lo prefiere.

3. **Ventana Unificada de Creación y Detalle (Master-Detail)**:
   - Reemplazar el formulario modal flotante por la misma vista a pantalla completa inspirada en `specific_detail_application_view`.
   - Al hacer clic en una tarjeta/fila: abre la ficha técnica detallada.
   - Al hacer clic en "+ Add Application": abre esa misma ficha en modo creación en blanco para ingresar la información.

4. **Notas Modulares con Título**:
   - Evolucionar el campo de notas de un texto plano único a una colección de notas independientes (cajones) donde cada una cuenta con título, contenido y fecha de registro, permitiendo agregar múltiples notas por vacante (ej. feedback de llamada, notas de entrevista técnica, beneficios).

5. **Timeline de Etapas con Fechas**:
   - Modelar el historial de fechas de cada etapa para registrar cuándo ocurrió la postulación (`Applied`), cuándo se agendó la entrevista (`Interview`), la oferta (`Offer`) o el cierre (`Rejected`), visualizándolo en el componente cronológico tipo timeline del mockup.

