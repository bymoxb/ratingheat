from pydantic import BaseModel
from typing import Optional, List

class EpisodeSchema(BaseModel):
    tconst: str
    seasonNumber: Optional[int]
    episodeNumber: Optional[int]
    averageRating: Optional[float]
    numVotes: Optional[int]

    class Config:
        from_attributes = True

class SeriesSchema(BaseModel):
    tconst: str
    titleType: str
    primaryTitle: str
    startYear: Optional[int]
    endYear: Optional[int]
    genres: Optional[str]
    averageRating: Optional[float]
    numVotes: Optional[int]

    class Config:
        from_attributes = True