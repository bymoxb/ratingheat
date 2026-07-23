package sqlite

import (
	"strings"

	"github.com/bymoxb/ratingheat/internal/domain/episode"
	"github.com/bymoxb/ratingheat/internal/domain/serie"
	"gorm.io/gorm"
)

type SerieRepositoryImpl struct {
	db *gorm.DB
}

func NewSerieRepositoryImpl(db *gorm.DB) *SerieRepositoryImpl {
	return &SerieRepositoryImpl{
		db: db,
	}
}

func (self *SerieRepositoryImpl) SearchSeries(title string) []serie.Serie {

	title = strings.ToLower(strings.TrimSpace(title))
	title = strings.ReplaceAll(title, " ", "%")

	var items []serie.Serie = []serie.Serie{}

	var sqlResult []SerieModel = []SerieModel{}
	result := self.db.
		Where("LOWER(primaryTitle) LIKE ?", "%"+title+"%").
		Order("numVotes desc").
		Order("AverageRating desc").
		Limit(5).
		Find(&sqlResult)

	if result.Error != nil {
		return items
	}

	for _, item := range sqlResult {
		items = append(items, serie.Serie{
			Tconst:        item.Tconst,
			TitleType:     item.TitleType,
			PrimaryTitle:  item.PrimaryTitle,
			Genres:        item.Genres,
			StartYear:     item.StartYear,
			EndYear:       item.EndYear,
			AverageRating: item.AverageRating,
			NumVotes:      item.NumVotes,
		})
	}

	return items
}

func (self *SerieRepositoryImpl) GetSerieById(tconst string) *serie.Serie {
	var entity *SerieModel

	result := self.db.Where(&SerieModel{Tconst: tconst}).First(&entity)
	if result.Error != nil {
		return nil
	}

	return &serie.Serie{
		Tconst:        entity.Tconst,
		TitleType:     entity.TitleType,
		PrimaryTitle:  entity.PrimaryTitle,
		Genres:        entity.Genres,
		StartYear:     entity.StartYear,
		EndYear:       entity.EndYear,
		AverageRating: entity.AverageRating,
		NumVotes:      entity.NumVotes,
	}
}

func (self *SerieRepositoryImpl) GetEpisodesBySerieId(tconst string) []episode.Episode {
	var items []episode.Episode = []episode.Episode{}

	var sqlResult []EpisodeModel
	result := self.db.
		Where("ParentTconst = ?", tconst).
		Order("SeasonNumber asc").
		Order("EpisodeNumber asc").
		Find(&sqlResult)

	if result.Error != nil {
		return items
	}

	for _, item := range sqlResult {
		items = append(items, episode.Episode{
			Tconst:        item.Tconst,
			ParentTconst:  item.ParentTconst,
			SeasonNumber:  item.SeasonNumber,
			EpisodeNumber: item.EpisodeNumber,
			AverageRating: item.AverageRating,
			NumVotes:      item.NumVotes,
		})
	}

	return items
}
