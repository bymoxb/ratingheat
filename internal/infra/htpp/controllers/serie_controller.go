package controllers

import (
	"net/http"

	"github.com/bymoxb/ratingheat/internal/application/services"
	"github.com/bymoxb/ratingheat/internal/infra/htpp/dtos"
	"github.com/gin-gonic/gin"
)

type SerieController struct {
	service *services.SerieService
}

func NewSerieController(service *services.SerieService) *SerieController {
	return &SerieController{
		service: service,
	}
}

func (self *SerieController) SearchSeries(gc *gin.Context) {

	var items []dtos.SerieDTO = []dtos.SerieDTO{}

	for _, item := range self.service.SearchSeries(gc.Query("title")) {
		items = append(items, dtos.MapSerieModelToDTO(&item))
	}

	gc.JSON(http.StatusOK, gin.H{
		"ok":   true,
		"data": items,
	})
}

func (self *SerieController) GetSerieById(gc *gin.Context) {
	payload := self.service.GetSerieById(gc.Param("id"))

	if payload == nil {
		gc.JSON(http.StatusNotFound, gin.H{
			"ok":   false,
			"data": nil,
		})
	}

	gc.JSON(http.StatusOK, gin.H{
		"ok":   true,
		"data": dtos.MapSerieModelToDTO(payload),
	})

}

func (self *SerieController) GetEpisodesBySerieId(gc *gin.Context) {
	var items []dtos.EpisodeDTO = []dtos.EpisodeDTO{}

	for _, item := range self.service.GetEpisodesBySerieId(gc.Param("id")) {
		items = append(items, dtos.MapEpisodeModelToDTO(item))
	}

	gc.JSON(http.StatusOK, gin.H{
		"ok":   true,
		"data": items,
	})

}
