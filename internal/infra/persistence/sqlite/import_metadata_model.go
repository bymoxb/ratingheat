package sqlite

type ImportMetadataModel struct {
	ImportedAt string `gorm:"type:TEXT;primary_key"`
}

func (ImportMetadataModel) TableName() string {
	return "import_metadata"
}
