import sqlite3
import csv
import gzip
import os
import psutil
import time


def mostrar_memoria(etapa=""):
    proceso = psutil.Process(os.getpid())
    memoria = proceso.memory_info().rss / 1024 / 1024
    print(f"[MEMORIA {etapa}] {memoria:.2f} MB")


def crear_tabla_ratings(conn, file_ratings):
    print("Importando ratings...")

    cur = conn.cursor()

    cur.execute("DROP TABLE IF EXISTS ratings;")

    cur.execute("""
        CREATE TABLE ratings (
            tconst TEXT PRIMARY KEY,
            averageRating REAL,
            numVotes INTEGER
        );
    """)

    batch = []

    with gzip.open(
        file_ratings,
        "rt",
        encoding="utf-8"
    ) as f:

        reader = csv.DictReader(
            f,
            delimiter="\t"
        )

        for row in reader:

            batch.append(
                (
                    row["tconst"],
                    float(row["averageRating"])
                    if row["averageRating"] != "\\N"
                    else None,

                    int(row["numVotes"])
                    if row["numVotes"] != "\\N"
                    else None
                )
            )

            if len(batch) >= 10000:

                cur.executemany(
                    """
                    INSERT INTO ratings
                    VALUES (?,?,?)
                    """,
                    batch
                )

                conn.commit()
                batch.clear()

    if batch:
        cur.executemany(
            """
            INSERT INTO ratings
            VALUES (?,?,?)
            """,
            batch
        )
        conn.commit()

    cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_ratings_tconst
        ON ratings(tconst)
    """)

    conn.commit()


def procesar_series(
    conn,
    file_basics,
    min_votes
):

    print("Procesando series...")

    cur = conn.cursor()

    cur.execute("""
        DROP TABLE IF EXISTS series;
    """)

    cur.execute("""
        CREATE TABLE series (
            tconst TEXT PRIMARY KEY,
            titleType TEXT,
            primaryTitle TEXT,
            startYear INTEGER,
            endYear INTEGER,
            genres TEXT,
            averageRating REAL,
            numVotes INTEGER
        );
    """)

    batch = []

    with gzip.open(
        file_basics,
        "rt",
        encoding="utf-8"
    ) as f:

        reader = csv.DictReader(
            f,
            delimiter="\t"
        )

        for row in reader:

            if row["titleType"] not in (
                "tvSeries",
                "tvMiniSeries"
            ):
                continue

            rating = cur.execute(
                """
                SELECT
                    averageRating,
                    numVotes
                FROM ratings
                WHERE tconst=?
                """,
                (row["tconst"],)
            ).fetchone()

            if rating is None:
                continue

            if rating[1] < min_votes:
                continue

            batch.append(
                (
                    row["tconst"],
                    row["titleType"],
                    row["primaryTitle"],

                    int(row["startYear"])
                    if row["startYear"] != "\\N"
                    else None,

                    int(row["endYear"])
                    if row["endYear"] != "\\N"
                    else None,

                    row["genres"],

                    rating[0],
                    rating[1]
                )
            )

            if len(batch) >= 5000:

                cur.executemany(
                    """
                    INSERT INTO series
                    VALUES (?,?,?,?,?,?,?,?)
                    """,
                    batch
                )

                conn.commit()
                batch.clear()

    if batch:

        cur.executemany(
            """
            INSERT INTO series
            VALUES (?,?,?,?,?,?,?,?)
            """,
            batch
        )

        conn.commit()

    cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_series_tconst
        ON series(tconst)
    """)

    conn.commit()


def procesar_episodios(
    conn,
    file_episodes
):

    print("Procesando episodios...")

    cur = conn.cursor()

    cur.execute("""
        DROP TABLE IF EXISTS episodes;
    """)

    cur.execute("""
        CREATE TABLE episodes (
            tconst TEXT PRIMARY KEY,
            parentTconst TEXT,
            seasonNumber INTEGER,
            episodeNumber INTEGER,
            averageRating REAL,
            numVotes INTEGER
        );
    """)

    batch = []

    with gzip.open(
        file_episodes,
        "rt",
        encoding="utf-8"
    ) as f:

        reader = csv.DictReader(
            f,
            delimiter="\t"
        )

        for row in reader:

            exists = cur.execute(
                """
                SELECT 1
                FROM series
                WHERE tconst=?
                """,
                (row["parentTconst"],)
            ).fetchone()

            if exists is None:
                continue

            rating = cur.execute(
                """
                SELECT
                    averageRating,
                    numVotes
                FROM ratings
                WHERE tconst=?
                """,
                (row["tconst"],)
            ).fetchone()

            if rating is None:
                continue

            batch.append(
                (
                    row["tconst"],
                    row["parentTconst"],

                    int(row["seasonNumber"])
                    if row["seasonNumber"] != "\\N"
                    else None,

                    int(row["episodeNumber"])
                    if row["episodeNumber"] != "\\N"
                    else None,

                    rating[0],
                    rating[1]
                )
            )

            if len(batch) >= 5000:

                cur.executemany(
                    """
                    INSERT INTO episodes
                    VALUES (?,?,?,?,?,?)
                    """,
                    batch
                )

                conn.commit()
                batch.clear()

    if batch:

        cur.executemany(
            """
            INSERT INTO episodes
            VALUES (?,?,?,?,?,?)
            """,
            batch
        )

        conn.commit()


def exportar_sqlite_final(
    conn,
    output
):

    print("Creando SQLite final...")

    if os.path.exists(output):
        os.remove(output)

    final = sqlite3.connect(output)

    conn.backup(final)

    final.close()


def main():

    inicio = time.time()

    conn = sqlite3.connect(
        "imdb_temp.sqlite"
    )

    # Reduce memoria RAM de SQLite
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.execute("PRAGMA temp_store=FILE")
    conn.execute("PRAGMA cache_size=-20000")

    mostrar_memoria("inicio")

    crear_tabla_ratings(
        conn,
        "title.ratings.tsv.gz"
    )

    mostrar_memoria("ratings")

    procesar_series(
        conn,
        "title.basics.tsv.gz",
        10_000
    )

    mostrar_memoria("series")

    procesar_episodios(
        conn,
        "title.episode.tsv.gz"
    )

    mostrar_memoria("episodios")

    print(
        conn.execute(
            "SELECT COUNT(*) FROM series"
        ).fetchone()
    )

    print(
        conn.execute(
            "SELECT COUNT(*) FROM episodes"
        ).fetchone()
    )

    exportar_sqlite_final(
        conn,
        "imdb.sqlite"
    )

    conn.close()

    print(
        "Tiempo total:",
        round(time.time()-inicio, 2),
        "segundos"
    )


if __name__ == "__main__":
    main()
