from sqlalchemy import Column, String, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from .database import Base

class Series(Base):
    __tablename__ = "series"

    tconst: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    titleType: Mapped[str] = mapped_column(String)
    primaryTitle: Mapped[str] = mapped_column(String, index=True)
    startYear: Mapped[int] = mapped_column(Integer, nullable=True)
    endYear: Mapped[int] = mapped_column(Integer, nullable=True)
    genres: Mapped[str] = mapped_column(String, nullable=True)
    averageRating: Mapped[float] = mapped_column(Float, nullable=True)
    numVotes: Mapped[int] = mapped_column(Integer, nullable=True)

    # Relación: una serie tiene muchos episodios
    episodes = relationship("Episode", back_populates="series")

class Episode(Base):
    __tablename__ = "episodes"

    tconst: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    parentTconst: Mapped[str] = mapped_column(String, ForeignKey("series.tconst"))
    seasonNumber: Mapped[int] = mapped_column(Integer, nullable=True)
    episodeNumber: Mapped[int] = mapped_column(Integer, nullable=True)
    averageRating: Mapped[float] = mapped_column(Float, nullable=True)
    numVotes: Mapped[int] = mapped_column(Integer, nullable=True)

    # Relación: el episodio pertenece a una serie
    series = relationship("Series", back_populates="episodes")
    

class ImportMetadata(Base):
    __tablename__ = "import_metadata"

    imported_at: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        index=True,
    )
