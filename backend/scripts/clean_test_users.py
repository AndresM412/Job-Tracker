import os
import sys

# Asegurar que el directorio 'backend' esté en el path de Python
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database import SessionLocal
from app import models


def clean_test_users():
    db = SessionLocal()
    try:
        # Patrones de emails generados automáticamente en pruebas
        test_patterns = ["qa_user_%", "login_user_%", "logout_user_%", "delete_me%"]
        total_deleted = 0
        for pattern in test_patterns:
            users = db.query(models.User).filter(models.User.email.like(pattern)).all()
            for u in users:
                db.delete(u)
                total_deleted += 1
        db.commit()
        print(f"Limpieza completada: {total_deleted} usuarios de prueba eliminados.")
    except Exception as e:
        db.rollback()
        print(f"Error durante la limpieza: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    clean_test_users()

