package dtos

import "github.com/bymoxb/ratingheat/internal/domain/serie"

type SerieDTO struct {
	Tconst        string  `json:"tconst"`
	TitleType     string  `json:"titleType"`
	PrimaryTitle  string  `json:"primaryTitle"`
	StartYear     int     `json:"startYear"`
	EndYear       int     `json:"endYear"`
	Genres        string  `json:"genres"`
	AverageRating float64 `json:"averageRating"`
	NumVotes      int     `json:"numVotes"`
}

func MapSerieModelToDTO(model *serie.Serie) SerieDTO {
	return SerieDTO{
		Tconst:        model.Tconst,
		TitleType:     model.TitleType,
		PrimaryTitle:  model.PrimaryTitle,
		StartYear:     model.StartYear,
		EndYear:       model.EndYear,
		Genres:        model.Genres,
		AverageRating: model.AverageRating,
		NumVotes:      model.NumVotes,
	}
}
