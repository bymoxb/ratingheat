package serie

import "github.com/bymoxb/ratingheat/internal/domain/episode"

type SerieRepository interface {
	SearchSeries(title string) []Serie
	GetSerieById(tconst string) *Serie
	GetEpisodesBySerieId(tconst string) []episode.Episode
}
