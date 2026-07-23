package main

import (
	"database/sql"
	"fmt"
	"log/slog"
	"os"
	"runtime"
	"runtime/debug"
	"strings"
	"time"

	"github.com/bymoxb/ratingheat/internal/infra/config"
	_ "github.com/duckdb/duckdb-go/v2"
)

func elapsedTimeStr(seconds float64) string {
	hours := int(seconds / 3600)
	rem := int(seconds) % 3600

	minutes := rem / 60
	secs := seconds - float64(int(seconds/60)*60)

	if seconds < 3600 {
		return fmt.Sprintf("%d min and %.2f s.", minutes, secs)
	}

	return fmt.Sprintf("%d h, %d min and %.2f s.", hours, minutes, secs)
}

const DATE_FORMAT = "2006-01-02 15:04:05"

func main() {

	handler := slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug})
	logger := slog.New(handler)

	slog.SetDefault(logger)

	var err error
	var cfg *config.Config

	if cfg, err = config.LoadEnv(); err != nil {
		os.Exit(1)
		return
	}

	if cfg.ImportONStartUp {
		Run(cfg)
	}

}

func Run(cfg *config.Config) {

	wallStart := time.Now()
	perfStart := time.Now()

	slog.Info("Starting Rating Importer Pipeline...")

	con, err := getConnection(cfg)

	if err != nil {
		slog.Error("Pipeline execution stopped", "error", err)
		return
	}

	err = processImdbData(con, cfg)
	if err != nil {
		slog.Error("Pipeline execution stopped", "error", err)
		return
	}

	err = recordImportMetadata(con)
	if err != nil {
		slog.Error("Pipeline execution stopped", "error", err)
		return
	}

	err = exportToSqlite(con, cfg)
	if err != nil {
		slog.Error("Pipeline execution stopped", "error", err)
		return
	}

	printMem("before close")

	if err := con.Close(); err != nil {
		slog.Error(
			"DuckDB close failed",
			"error",
			err,
		)
	}

	runtime.GC()
	debug.FreeOSMemory()

	printMem("after close")

	cleanup(cfg)

	slog.Info("All steps executed successfully")

	perfEnd := time.Now()
	wallEnd := time.Now()

	elapsed := perfEnd.Sub(perfStart).Seconds()

	startStr := wallStart.Format(DATE_FORMAT)
	endStr := wallEnd.Format(DATE_FORMAT)

	slog.Info(strings.Repeat("-", 40))

	slog.Info("Execution started", "time", startStr)
	slog.Info("Execution ended", "time", endStr)
	slog.Info("Total duration", "duration", elapsedTimeStr(elapsed))

	slog.Info(strings.Repeat("-", 40))

	//
	runtime.GC()
	debug.FreeOSMemory()

	printMem("after import")
}

func printMem(label string) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	slog.Debug(
		label,
		"Alloc", m.Alloc/1024/1024,
		"Sys", m.Sys/1024/1024,
		"HeapIdle", m.HeapIdle/1024/1024,
		"HeapReleased", m.HeapReleased/1024/1024,
	)
}

func getConnection(cfg *config.Config) (*sql.DB, error) {
	con, err := sql.Open("duckdb", cfg.DuckDB)

	if err != nil {
		slog.Error("Database connection error", "error", err)
		return nil, err
	}

	con.SetMaxOpenConns(1)
	con.SetMaxIdleConns(0)

	queries := []string{
		fmt.Sprintf("SET memory_limit='%s';", cfg.DuckDBMemoryLimit),
		fmt.Sprintf("SET threads=%d;", cfg.DuckDBThreads),
		"SET preserve_insertion_order=false;",
	}

	for _, query := range queries {
		_, err = con.Exec(query)
		if err != nil {
			slog.Error(
				"DuckDB configuration error",
				"error", err,
				"query", query,
			)
			con.Close()
			return nil, err
		}
	}

	slog.Info(
		"Connected to DuckDB",
		"threads", cfg.DuckDBThreads,
		"memory_limit", cfg.DuckDBMemoryLimit,
	)

	return con, nil
}

func processImdbData(con *sql.DB, cfg *config.Config) error {

	queries := []struct {
		name  string
		query string
	}{
		{
			name: "Processing Ratings",
			query: `
			CREATE OR REPLACE TABLE ratings AS
			SELECT *
			FROM read_csv(
				'` + cfg.IMDBRatingsUrl + `',
				delim='\t',
				header=True,
				compression='gzip',
				nullstr='\N',
				columns={
					'tconst':'VARCHAR',
					'averageRating':'DOUBLE',
					'numVotes':'INTEGER'
				}
			);
			`,
		},
		{
			name: fmt.Sprintf("Processing Series: %s", cfg.IMDBTitleTypes),
			query: `
			CREATE OR REPLACE TABLE series AS
			SELECT 
				tconst,
				titleType,
				primaryTitle,
				startYear,
				endYear,
				genres
			FROM read_csv(
				'` + cfg.IMDBBasicsUrl + `',
				delim='\t',
				header=True,
				compression='gzip',
				nullstr='\N',
				columns={
					'tconst':'VARCHAR',
					'titleType':'VARCHAR',
					'primaryTitle':'VARCHAR',
					'originalTitle':'VARCHAR',
					'isAdult':'BOOLEAN',
					'startYear':'INTEGER',
					'endYear':'INTEGER',
					'runtimeMinutes':'INTEGER',
					'genres':'VARCHAR'
				}
			)
			WHERE titleType IN (` + cfg.IMDBTitleTypes + `);
			`,
		},
		{
			name: fmt.Sprintf("Filtering Series Ratings: %d min vites", cfg.IMDBMinVotes),
			query: `
			CREATE OR REPLACE TABLE series_rating AS
			SELECT 
				s.*,
				r.averageRating,
				r.numVotes
			FROM series s
			INNER JOIN ratings r
				ON s.tconst = r.tconst
			WHERE r.numVotes >= ` + fmt.Sprintf("%d", cfg.IMDBMinVotes) + `;
			`,
		},
		{
			name: "Processing Episodes",
			query: `
			CREATE OR REPLACE TABLE episodes AS
			SELECT 
				e.tconst,
				e.parentTconst,
				e.seasonNumber,
				e.episodeNumber,
				r.averageRating,
				r.numVotes
			FROM read_csv(
				'` + cfg.IMDBEpisodeUrl + `',
				delim='\t',
				header=True,
				compression='gzip',
				nullstr='\N',
				columns={
					'tconst':'VARCHAR',
					'parentTconst':'VARCHAR',
					'seasonNumber':'INTEGER',
					'episodeNumber':'INTEGER'
				}
			) e
			JOIN ratings r
				ON e.tconst = r.tconst
			JOIN series_rating s
				ON e.parentTconst = s.tconst
			WHERE e.seasonNumber IS NOT NULL
			  AND e.episodeNumber IS NOT NULL;
			`,
		},
	}

	for _, item := range queries {
		slog.Info("Executing query", "name", item.name)

		_, err := con.Exec(item.query)
		if err != nil {
			slog.Error(
				"Data processing failed",
				"step", item.name,
				"error", err,
			)
			return err
		}
	}

	var (
		st int
		et int
	)

	var row *sql.Row

	row = con.QueryRow("SELECT count(*) as st FROM series_rating")
	row.Scan(&st)
	row = con.QueryRow("SELECT count(*) as et FROM episodes")
	row.Scan(&et)

	slog.Info("Total Series", "count", st)
	slog.Info("Total Episodes", "count", et)

	return nil
}

func recordImportMetadata(con *sql.DB) error {
	slog.Info("Recording import timestamp")

	query := `
	CREATE OR REPLACE TABLE import_metadata AS
	SELECT CURRENT_TIMESTAMP AS importedAt;
	`

	_, err := con.Exec(query)
	if err != nil {
		slog.Error(
			"Failed to record metadata",
			"error", err,
		)

		return err
	}

	return nil
}

func exportToSqlite(con *sql.DB, cfg *config.Config) error {

	slog.Info(
		"Exporting to SQLite",
		"path", cfg.SQLITE_PATH,
	)

	queries := []string{
		fmt.Sprintf(
			"ATTACH '%s' AS sqlite_db (TYPE SQLITE);",
			cfg.SQLITE_PATH,
		),

		`
		CREATE OR REPLACE TABLE sqlite_db.series AS
		SELECT * FROM series_rating;
		`,

		`
		CREATE OR REPLACE TABLE sqlite_db.episodes AS
		SELECT * FROM episodes;
		`,

		`
		CREATE OR REPLACE TABLE sqlite_db.import_metadata AS
		SELECT * FROM import_metadata;
		`,

		"DETACH sqlite_db;",
	}

	for _, query := range queries {
		_, err := con.Exec(query)
		if err != nil {
			slog.Error(
				"Export failed",
				"error", err,
				"query", query,
			)
			return err
		}
	}

	return nil
}

func cleanup(cfg *config.Config) {

	_, err := os.Stat(cfg.DuckDB)

	if os.IsNotExist(err) {
		return
	}

	if err != nil {
		slog.Error(
			"Cleanup check failed",
			"error", err,
		)
		return
	}

	err = os.Remove(cfg.DuckDB)

	if err != nil {
		slog.Error(
			"Cleanup failed",
			"error", err,
			"path", cfg.DuckDB,
		)
		return
	}

	slog.Info(
		"Cleaned up temporary file",
		"path", cfg.DuckDB,
	)
}
