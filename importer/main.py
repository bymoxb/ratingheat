import duckdb
import os
import logging
import time
from dotenv import load_dotenv

DATE_FORMAT = '%Y-%m-%d %H:%M:%S'

# --- Logging Configuration ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt=DATE_FORMAT
)
logger = logging.getLogger(__name__)

load_dotenv()

# --- Configuration & Constants ---
IMDB_RATINGS_PATH = os.getenv(
    "IMDB_RATINGS_PATH", "https://datasets.imdbws.com/title.ratings.tsv.gz")
IMDB_BASICS_PATH = os.getenv(
    "IMDB_BASICS_PATH", "https://datasets.imdbws.com/title.basics.tsv.gz")
IMDB_EPISODE_PATH = os.getenv(
    "IMDB_EPISODE_PATH", "https://datasets.imdbws.com/title.episode.tsv.gz")

# Parameterized Filters
MIN_VOTES = int(os.getenv("IMDB_MIN_VOTES", "10000"))
RAW_TITLE_TYPES = os.getenv("IMDB_TITLE_TYPES", "tvSeries,tvMiniSeries")
FORMATTED_TITLE_TYPES = ",".join(
    [f"'{t.strip()}'" for t in RAW_TITLE_TYPES.split(",")])

MEMORY_LIMIT = os.getenv("DUCKDB_MEMORY_LIMIT", "512MB")
THREADS = os.getenv("DUCKDB_THREADS", os.cpu_count() or 1)
DATABASE = os.getenv("DUCKDB_DATABASE", "imdb.duckdb")
SQLITE_PATH = os.getenv("SQLITE_PATH", "imdb.sqlite")


def elapsed_time_str(seconds):
    """
    Returns a human-readable string of the duration.
    """
    hours, rem = divmod(seconds, 3600)
    minutes, secs = divmod(rem, 60)

    if seconds < 3600:
        return f"{int(minutes)} min and {secs:.2f} s."
    else:
        return f"{int(hours)} h, {int(minutes)} min and {secs:.2f} s."


def get_connection():
    try:
        con = duckdb.connect(DATABASE)
        con.execute(f"SET memory_limit='{MEMORY_LIMIT}';")
        con.execute(f"SET threads={THREADS};")
        con.execute("SET preserve_insertion_order=false;")
        logger.info(
            f"Connected to DuckDB (Threads: {THREADS}, Memory: {MEMORY_LIMIT})")
        return con
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise


def process_imdb_data(con):
    try:
        logger.info("Processing Ratings...")
        con.execute(
            f"CREATE OR REPLACE TABLE ratings AS SELECT * FROM read_csv_auto('{IMDB_RATINGS_PATH}', delim='\t', header=True, compression='gzip');")

        logger.info(f"Processing Series (Types: {RAW_TITLE_TYPES})...")
        con.execute(f"""
            CREATE OR REPLACE TABLE series AS
            SELECT tconst, titleType, primaryTitle, TRY_CAST(startYear AS INTEGER) AS startYear, TRY_CAST(endYear AS INTEGER) AS endYear, genres
            FROM read_csv_auto('{IMDB_BASICS_PATH}', delim='\t', header=True, compression='gzip')
            WHERE titleType IN ({FORMATTED_TITLE_TYPES});
        """)

        logger.info(f"Filtering with Votes >= {MIN_VOTES}...")
        con.execute(
            f"CREATE OR REPLACE TABLE series_rating AS SELECT s.*, r.averageRating, r.numVotes FROM series s INNER JOIN ratings r ON s.tconst = r.tconst WHERE r.numVotes >= {MIN_VOTES};")

        logger.info("Processing Episodes...")
        con.execute(f"""
            CREATE OR REPLACE TABLE episodes AS
            SELECT e.tconst, e.parentTconst, TRY_CAST(e.seasonNumber AS INTEGER) AS seasonNumber, TRY_CAST(e.episodeNumber AS INTEGER) AS episodeNumber, r.averageRating, r.numVotes
            FROM read_csv_auto('{IMDB_EPISODE_PATH}', delim='\t', header=True, compression='gzip', nullstr=['\\N']) e
            JOIN ratings r ON e.tconst = r.tconst
            JOIN series s ON e.parentTconst = s.tconst
            WHERE e.seasonNumber IS NOT NULL AND e.episodeNumber IS NOT NULL;
        """)
    except Exception as e:
        logger.error(f"Data processing failed: {e}")
        raise


def record_import_metadata(con):
    """
    Creates a metadata table to track when the import occurred.
    """
    try:
        logger.info("Recording import timestamp...")
        con.execute("""
            CREATE OR REPLACE TABLE import_metadata AS 
            SELECT CURRENT_TIMESTAMP as imported_at;
        """)
    except Exception as e:
        logger.error(f"Failed to record metadata: {e}")
        raise


def export_to_sqlite(con):
    try:
        logger.info(f"Exporting to SQLite: {SQLITE_PATH}")
        con.execute(f"ATTACH '{SQLITE_PATH}' AS sqlite_db (TYPE SQLITE);")
        # con.execute("DROP TABLE IF EXISTS sqlite_db.series; DROP TABLE IF EXISTS sqlite_db.episodes; DROP TABLE IF EXISTS sqlite_db.import_metadata;")
        con.execute(
            "CREATE OR REPLACE TABLE sqlite_db.series AS SELECT * FROM series_rating;")
        con.execute(
            "CREATE OR REPLACE TABLE sqlite_db.episodes AS SELECT * FROM episodes;")
        con.execute(
            "CREATE OR REPLACE TABLE sqlite_db.import_metadata AS SELECT * FROM import_metadata;")
        con.execute("DETACH sqlite_db;")
    except Exception as e:
        logger.error(f"Export failed: {e}")
        raise


def cleanup():
    if os.path.exists(DATABASE):
        try:
            os.remove(DATABASE)
            logger.info(f"Cleaned up temporary file: {DATABASE}")
        except Exception as e:
            logger.warning(f"Cleanup failed: {e}")


def main():
    wall_start = time.time()
    perf_start = time.perf_counter()

    logger.info("Starting IMDB Pipeline...")

    try:
        with get_connection() as con:
            process_imdb_data(con)
            record_import_metadata(con)
            export_to_sqlite(con)
        logger.info("All steps executed successfully.")
    except Exception as e:
        logger.critical(f"Pipeline execution stopped: {e}")
    finally:
        cleanup()

    perf_end = time.perf_counter()
    wall_end = time.time()

    elapsed = perf_end - perf_start
    start_str = time.strftime(DATE_FORMAT, time.localtime(wall_start))
    end_str = time.strftime(DATE_FORMAT, time.localtime(wall_end))

    logger.info("-" * 40)
    logger.info(f"Execution started at: {start_str}")
    logger.info(f"Execution ended at:   {end_str}")
    logger.info(f"Total duration:       {elapsed_time_str(elapsed)}")
    logger.info("-" * 40)


if __name__ == "__main__":
    main()
