from fastapi import FastAPI
from .database import engine, Base
from .routers import series

# Crea las tablas si no existen (en producción usa Alembic)
# Base.metadata.create_all(bind=engine)

app = FastAPI(title="Series API")

app.include_router(series.router)


@app.get("/")
def health_check():
    return {"status": "ok"}
