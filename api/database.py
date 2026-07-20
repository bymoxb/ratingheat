import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Obtener la ruta absoluta del directorio actual
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Ruta de la base de datos
DB_PATH = os.path.join(BASE_DIR, "../", "imdb.sqlite")

print("BASE_DIR:", BASE_DIR)
print("DB_PATH:", DB_PATH)

# Validar que la base de datos exista
if not os.path.isfile(DB_PATH):
    raise FileNotFoundError(
        f"No se encontró la base de datos SQLite: {DB_PATH}"
    )

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
