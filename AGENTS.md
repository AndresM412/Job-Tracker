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
- Nunca perder de vista nullable=True temporal en `user_id` de
  `job_applications` — es un TODO pendiente que debe volver a
  `nullable=False` una vez la autenticación esté completamente conectada
  en todos los endpoints de /jobs.

## Estado actual

Backend: registro y login con JWT funcionando. POST /jobs y GET /jobs protegidos con el usuario autenticado (filtrado por user_id). Pendiente: proteger PUT/DELETE de /jobs y revertir user_id a NOT NULL en la base de datos.

Frontend: aún sin pantallas de login/registro, sin manejo de token.

Tests: aún no actualizados para requerir login antes de operar sobre jobs.
