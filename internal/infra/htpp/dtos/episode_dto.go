package dtos

import "github.com/bymoxb/ratingheat/internal/domain/episode"

type EpisodeDTO struct {
	Tconst        string  `json:"tconst"`
	ParentTconst  string  `json:"parentTconst"`
	SeasonNumber  int     `json:"seasonNumber"`
	EpisodeNumber int     `json:"episodeNumber"`
	AverageRating float64 `json:"averageRating"`
	NumVotes      int     `json:"numVotes"`
}

func MapEpisodeModelToDTO(model episode.Episode) EpisodeDTO {
	return EpisodeDTO{
		Tconst:        model.Tconst,
		ParentTconst:  model.ParentTconst,
		SeasonNumber:  model.SeasonNumber,
		EpisodeNumber: model.EpisodeNumber,
		AverageRating: model.AverageRating,
		NumVotes:      model.NumVotes,
	}
}
