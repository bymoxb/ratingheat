package app

import (
	"fmt"
	"os"
	"os/exec"

	"github.com/bymoxb/ratingheat/internal/application/services"
	"github.com/bymoxb/ratingheat/internal/infra/config"
	"github.com/bymoxb/ratingheat/internal/infra/http/controllers"
	"github.com/bymoxb/ratingheat/internal/infra/http/static"
	"github.com/bymoxb/ratingheat/internal/infra/persistence/sqlite"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type App struct {
	router *gin.Engine
}

func NewApp() (*App, error) {

	var err error
	var cfg *config.Config
	var db *gorm.DB

	if cfg, err = config.LoadEnv(); err != nil {
		return nil, err
	}

	fmt.Printf("Config: %#v\n", cfg)

	if db, err = config.InitDB(cfg); err != nil {
		return nil, err
	}

	if err = sqlite.Migrate(db); err != nil {
		return nil, err
	}

	router := gin.Default()

	apiGroups := router.Group("/api")

	SetupApiRoutes(db, apiGroups)

	if err = static.SetupStaticRoutes(router); err != nil {
		return nil, err
	}

	if err = SetupImporter(cfg); err != nil {
		return nil, err
	}

	if err = SetupOrigins(cfg, router); err != nil {
		return nil, err
	}

	return &App{
		router: router,
	}, nil
}

func SetupImporter(cfg *config.Config) error {

	_, err := os.Stat(cfg.ImporterPath)

	if os.IsNotExist(err) {
		return fmt.Errorf("Rating importer script not exists in path: %s", cfg.ImporterPath)
	}

	if cfg.ImportONStartUp {
		go RunImporter(cfg)
	}

	return nil
}

func RunImporter(cfg *config.Config) {

	cmd := exec.Command(cfg.ImporterPath)

	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin

	if err := cmd.Run(); err != nil {
		panic(err)
	}
}

func SetupApiRoutes(db *gorm.DB, groups *gin.RouterGroup) {
	serieRepository := sqlite.NewSerieRepositoryImpl(db)
	serieService := services.NewSerieService(serieRepository)
	serieController := controllers.NewSerieController(serieService)

	groups.GET("/series", serieController.SearchSeries)
	groups.GET("/series/:id", serieController.GetSerieById)
	groups.GET("/series/:id/episodes", serieController.GetEpisodesBySerieId)
}

func SetupOrigins(cfg *config.Config, router *gin.Engine) error {

	switch cfg.TrustedPlatform {
	case "cloudflare":
		router.TrustedPlatform = gin.PlatformCloudflare
	default:
		return fmt.Errorf("Unsupported trusted platform: %s", cfg.TrustedPlatform)
	}

	if err := router.SetTrustedProxies(cfg.TrustedProxies); err != nil {
		return fmt.Errorf("Error setting trusted proxies: %w", err)
	}

	return nil
}

func (self *App) Run() {
	self.router.Run()
}
