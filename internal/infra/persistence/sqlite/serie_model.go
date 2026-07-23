package sqlite

type SerieModel struct {
	Tconst        string  `gorm:"column:tconst;type:TEXT;primaryKey"`
	TitleType     string  `gorm:"column:titleType;type:TEXT"`
	PrimaryTitle  string  `gorm:"column:primaryTitle;type:TEXT"`
	StartYear     int     `gorm:"column:startYear;type:INTEGER"`
	EndYear       int     `gorm:"column:endYear;type:INTEGER"`
	Genres        string  `gorm:"column:genres;type:TEXT"`
	AverageRating float64 `gorm:"column:averageRating;type:REAL"`
	NumVotes      int     `gorm:"column:numVotes;type:INTEGER"`
}

func (SerieModel) TableName() string {
	return "series"
}
