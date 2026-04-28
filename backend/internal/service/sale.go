package service

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/AVGsync/analysis-pro/backend/internal/model"
	"github.com/AVGsync/analysis-pro/backend/internal/model/request"
)

type SaleRepository interface {
	GetSaleDetails(ctx context.Context, from, to time.Time) ([]model.SaleDetail, error)
}

type SaleService struct {
	repository SaleRepository
}

func NewSaleService(repository SaleRepository) *SaleService {
	return &SaleService{
		repository: repository,
	}
}

func (s *SaleService) GetSaleDetails(ctx context.Context, req request.DetailsSaleRequest) ([]model.SaleDetail, error) {
	var from, to time.Time

	if req.From == "" {
		from = time.Now().AddDate(0, -1, 0) // default to 1 month ago
	} else {
		var err error
		from, err = time.Parse("2006-01-02", req.From)
		if err != nil {
			slog.Debug("invalid from date", "error", err, "from", req.From)
			return nil, fmt.Errorf("invalid from date: %w", err)
		}
	}

	if req.To == "" {
		to = time.Now()
	} else {
		var err error
		to, err = time.Parse("2006-01-02", req.To)
		if err != nil {
			slog.Debug("invalid to date", "error", err, "to", req.To)
			return nil, fmt.Errorf("invalid to date: %w", err)
		}
	}

	sales, err := s.repository.GetSaleDetails(ctx, from, to)
	if err != nil {
		slog.Debug("failed to get sale details", "error", err, "from", from, "to", to)
		return nil, fmt.Errorf("failed to get sale details: %w", err)
	}
	
	return sales, nil
}
