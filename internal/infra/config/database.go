package config

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func InitDB(cfg *Config) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(cfg.SQLITE_PATH), &gorm.Config{})

	if err != nil {
		return nil, err
	}

	// Migrate the schema
	// db.AutoMigrate(&Product{})
	return db, nil
}
