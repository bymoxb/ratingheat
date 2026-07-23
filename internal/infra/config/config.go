package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	SQLITE_PATH       string
	TrustedProxies    []string
	TrustedPlatform   string
	DuckDB            string
	DuckDBThreads     int
	DuckDBMemoryLimit string
	IMDBMinVotes      int
	IMDBTitleTypes    string
	IMDBRatingsUrl    string
	IMDBBasicsUrl     string
	IMDBEpisodeUrl    string
	ImportONStartUp   bool
	ImporterPath      string
}

func LoadEnv() (*Config, error) {

	if os.Getenv("ENV") != "production" {
		if err := godotenv.Load(); err != nil {
			return nil, fmt.Errorf("Error loading .env file: %v", err)
		}
	}

	//
	DB_URL := os.Getenv("SQLITE_PATH")

	if DB_URL == "" {
		return nil, fmt.Errorf("SQLITE path not set")
	}

	//
	var trustedProxies []string
	trustedProxiesEnv := os.Getenv("DW_TRUSTED_PROXIES")
	if trustedProxiesEnv != "" {
		trustedProxies = strings.Split(trustedProxiesEnv, ",")
	} else {
		trustedProxies = append(trustedProxies, "127.0.0.1")
	}

	//
	var ImportONStartUp = true
	var importONStartUpEnv = os.Getenv("IMPORT_ONSTARTUP")
	if importONStartUpEnv == "false" {
		ImportONStartUp = false
	}

	//
	DuckDB := getenvString("DUCKDB_DATABASE", "/tmp/import.duckdb")
	DuckDBThreads := getenvInt("DUCKDB_THREADS", 1)
	DuckDBMemoryLimit := getenvString("DUCKDB_MEMORY_LIMIT", "512MB")

	IMDBMinVotes := getenvInt("IMDB_MIN_VOTES", 10000)
	IMDBTitleTypes := getenvString("IMDB_TITLE_TYPES", "'tvSeries','tvMiniSeries'")

	IMDBRatingsUrl := getenvString("IMDB_RATINGS_URL", "https://datasets.imdbws.com/title.ratings.tsv.gz")
	IMDBBasicsUrl := getenvString("IMDB_BASICS_URL", "https://datasets.imdbws.com/title.basics.tsv.gz")
	IMDBEpisodeUrl := getenvString("IMDB_EPISODE_URL", "https://datasets.imdbws.com/title.episode.tsv.gz")

	return &Config{
		SQLITE_PATH:       DB_URL,
		TrustedProxies:    trustedProxies,
		TrustedPlatform:   os.Getenv("DW_TRUSTED_PLATFORM"),
		DuckDBThreads:     DuckDBThreads,
		DuckDBMemoryLimit: DuckDBMemoryLimit,
		IMDBMinVotes:      IMDBMinVotes,
		IMDBTitleTypes:    IMDBTitleTypes,
		IMDBRatingsUrl:    IMDBRatingsUrl,
		IMDBBasicsUrl:     IMDBBasicsUrl,
		IMDBEpisodeUrl:    IMDBEpisodeUrl,
		ImportONStartUp:   ImportONStartUp,
		DuckDB:            DuckDB,
		ImporterPath:      getenvString("IMPORTER_PATH", "/app/ratingimporter"),
	}, nil
}

func getenvInt(key string, defaultValue int) int {
	value, ok := os.LookupEnv(key)
	if !ok || value == "" {
		return defaultValue
	}

	n, err := strconv.Atoi(value)
	if err != nil {
		return defaultValue
	}

	return n
}
func getenvString(key, defaultValue string) string {
	value, ok := os.LookupEnv(key)
	if !ok || value == "" {
		return defaultValue
	}

	return value
}
