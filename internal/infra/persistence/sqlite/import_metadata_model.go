package sqlite

type ImportMetadataModel struct {
	ImportedAt string `gorm:"column:importedAt;type:TEXT;primary_key"`
}

func (ImportMetadataModel) TableName() string {
	return "import_metadata"
}
