package services

import (
	"github.com/bymoxb/ratingheat/internal/domain/episode"
	"github.com/bymoxb/ratingheat/internal/domain/serie"
)

type SerieService struct {
	repo serie.SerieRepository
}

func NewSerieService(repo serie.SerieRepository) *SerieService {
	return &SerieService{
		repo: repo,
	}
}

func (self *SerieService) SearchSeries(title string) []serie.Serie {
	return self.repo.SearchSeries(title)
}

func (self *SerieService) GetSerieById(tconst string) *serie.Serie {
	return self.repo.GetSerieById(tconst)
}

func (self *SerieService) GetEpisodesBySerieId(tconst string) []episode.Episode {
	return self.repo.GetEpisodesBySerieId(tconst)
}
