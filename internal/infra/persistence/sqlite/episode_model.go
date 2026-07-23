package sqlite

type EpisodeModel struct {
	Tconst        string  `gorm:"column:tconst;type:TEXT;primaryKey"`
	ParentTconst  string  `gorm:"column:parentTconst;type:TEXT"`
	SeasonNumber  int     `gorm:"column:seasonNumber;type:INTEGER"`
	EpisodeNumber int     `gorm:"column:episodeNumber;type:INTEGER"`
	AverageRating float64 `gorm:"column:averageRating;type:REAL"`
	NumVotes      int     `gorm:"column:numVotes;type:INTEGER"`
}

func (EpisodeModel) TableName() string {
	return "episodes"
}
