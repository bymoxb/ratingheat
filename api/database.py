import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

SQLITE_PATH = os.getenv("SQLITE_PATH", "database/imdb.sqlite")

DB_PATH = Path(SQLITE_PATH).resolve()

DB_PATH.parent.mkdir(parents=True, exist_ok=True)

DATABASE_URL = f"sqlite:///{DB_PATH}"

print(f"Using database at: {DB_PATH}")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    pool_pre_ping=True,
    echo=False,  # Set True to log SQL statements
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


def get_db():
    """
    Provide a database session for each request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Create all registered tables if they do not already exist.

    Note:
        All model modules must be imported before calling this function.
    """
    Base.metadata.create_all(bind=engine)
