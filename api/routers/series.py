from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

router = APIRouter(prefix="/api/series", tags=["Series & Episodes"])

@router.get("/search", response_model=List[schemas.SeriesSchema])
def search_series(title: str, db: Session = Depends(database.get_db)):
    """
    Endpoint para buscar series por nombre (primaryTitle).
    Ejemplo: /series/search?title=office
    """
    return crud.search_series_by_title(db, title)


@router.get("/{tconst}", response_model=schemas.SeriesSchema)
def get_serie(tconst: str, db: Session = Depends(database.get_db)):
    """
    Endpoint para obtener una serie por su ID (tconst).
    Ejemplo: /series/tt0110475
    """
    return crud.get_serie_by_id(db, tconst)


@router.get("/{tconst}/episodes", response_model=List[schemas.EpisodeSchema])
def get_series_episodes(tconst: str, db: Session = Depends(database.get_db)):
    """
    Endpoint para obtener episodios dado el ID de la serie (tconst).
    Ejemplo: /series/tt0110475/episodes
    """
    return crud.get_episodes_by_series_id(db, tconst)
