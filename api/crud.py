from sqlalchemy.orm import Session
from sqlalchemy import select
from . import models


def search_series_by_title(db: Session, title: str):
    """
    Busca series cuyo primaryTitle coincida con el patrón (Case Insensitive).
    """
    query = (
        select(models.Series)
        .where(models.Series.primaryTitle.ilike(f"%{title}%"))
        .order_by(models.Series.averageRating.desc())
        .limit(5)
    )
    return db.execute(query).scalars().all()


def get_episodes_by_series_id(db: Session, series_id: str):
    """
    Busca todos los episodios que pertenezcan a una serie (parentTconst).
    """
    query = (
        select(models.Episode)
        .where(models.Episode.parentTconst == series_id)
        .where(models.Episode.seasonNumber.is_not(None))
        .where(models.Episode.episodeNumber.is_not(None))
        .order_by(models.Episode.seasonNumber.asc())
        .order_by(models.Episode.episodeNumber.asc())
    )
    return db.execute(query).scalars().all()
