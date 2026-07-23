package sqlite

type EpisodeModel struct {
	Tconst        string  `gorm:"type:TEXT;primary_key"`
	ParentTconst  string  `gorm:"type:TEXT"`
	SeasonNumber  int     `gorm:"type:INTEGER"`
	EpisodeNumber int     `gorm:"type:INTEGER"`
	AverageRating float64 `gorm:"type:REAL"`
	NumVotes      int     `gorm:"type:INTEGER"`
}

func (EpisodeModel) TableName() string {
	return "episodes"
}
