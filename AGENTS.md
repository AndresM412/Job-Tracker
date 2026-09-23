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

Backend: registro y login con JWT funcionando. Todos los endpoints de /jobs (GET, POST, PUT, DELETE) protegidos con autenticación JWT y filtrados por el user_id del usuario autenticado. Columna user_id con restricción NOT NULL (nullable=False). Suite de pruebas backend con Pytest (8/8 pasadas en verde con SQLite en memoria) cubriendo /register, /login, JWT y aislamiento multi-tenancy.

Frontend: pantallas de Login y Registro (AuthForm) conectadas con JWT, persistencia de token en localStorage, barra superior con usuario/logout, auto-detección de enlaces en notas y manejo de 401 por inactividad. Rediseño visual "Control Room v2" aplicado con banner de métricas KPI, badges en píldoras con indicador luminoso y resplandor (glow) al pasar el cursor, y modal accesible de confirmación de eliminación (ConfirmDeleteModal) con soporte WAI-ARIA y atajo de teclado Escape.

Tests: los 57 tests E2E de Playwright (42 originales de postulaciones y auth + 15 del modal de confirmación en Chromium, Firefox y WebKit) bajo el patrón Page Object Model (POM) mediante AuthPage y DashboardPage, y los 8 tests backend con Pytest pasando 100% en verde integrados en GitHub Actions CI (ci.yml).
