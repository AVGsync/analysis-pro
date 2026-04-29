package service

import (
	"context"
	"fmt"

	"github.com/AVGsync/analysis-pro/backend/internal/model"
)

type ExportRepository interface {
	GetAssortmentExportData(ctx context.Context) ([]model.AssortmentExportRow, error)
}

type ExportService struct {
	repo        ExportRepository
	forecastSvc *ForecastService
}

func NewExportService(repo ExportRepository, forecastSvc *ForecastService) *ExportService {
	return &ExportService{repo: repo, forecastSvc: forecastSvc}
}

func (s *ExportService) GetForecastExport(ctx context.Context, days, history int) ([]model.ForecastExportRow, error) {
	recommendations, err := s.forecastSvc.GetRecommendations(ctx, days, history)
	if err != nil {
		return nil, fmt.Errorf("export service: get forecast: %w", err)
	}

	rows := make([]model.ForecastExportRow, len(recommendations))
	for i, r := range recommendations {
		rows[i] = model.ForecastExportRow{
			ProductName:    r.ProductName,
			SKU:            r.SKU,
			ForecastTotal:  r.ForecastTotal,
			RecommendOrder: r.RecommendOrder,
			CurrentStock:   r.CurrentStock,
			Urgency:        r.Urgency,
		}
	}
	return rows, nil
}

func (s *ExportService) GetAssortmentExport(ctx context.Context) ([]model.AssortmentExportRow, error) {
	return s.repo.GetAssortmentExportData(ctx)
}