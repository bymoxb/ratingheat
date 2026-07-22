from contextlib import asynccontextmanager
from .routers import series
from .database import init_db
from fastapi import FastAPI
from dotenv import load_dotenv
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Series API", lifespan=lifespan)

app.include_router(series.router)

app.frontend("/", directory="dist", fallback="index.html",)
