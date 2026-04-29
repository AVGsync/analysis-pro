package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/AVGsync/analysis-pro/backend/internal/model"
)



type ForecastRepository interface {
	GetProductsWithSales(ctx context.Context, historyDays int) ([]model.ProductInput, error)
}

type ForecastService struct {
	forecastURL string
	repository  ForecastRepository
}

func NewForecastService(forecastURL string, repository ForecastRepository) *ForecastService {
	return &ForecastService{
		forecastURL: forecastURL,
		repository:  repository,
	}
}

func (s *ForecastService) GetForecast(ctx context.Context, days int, historyDays int) ([]model.ForecastDetail, error) {
	products, err := s.repository.GetProductsWithSales(ctx, historyDays)
	if err != nil {
		slog.Debug("failed to get products with sales", "error", err, "history_days", historyDays)
		return nil, err
	}

	res, err := callForecast[model.ForecastDetail](ctx, s.forecastURL+"/forecast", map[string]any{
		"forecast_days": days,
		"history_days":  historyDays,
		"products":      products,
	})
	if err != nil {
		slog.Debug("failed to call forecast service", "error", err, "forecast_days", days, "history_days", historyDays)
		return nil, err
	}

	return res, err
}

func (s *ForecastService) GetRecommendations(ctx context.Context, days int, historyDays int) ([]model.RecommendationItem, error) {
	products, err := s.repository.GetProductsWithSales(ctx, historyDays)
	if err != nil {
		slog.Debug("failed to get products with sales", "error", err, "history_days", historyDays)
		return nil, err
	}
	
	res, err := callForecast[model.RecommendationItem](ctx, s.forecastURL+"/recommendations", map[string]any{
		"forecast_days": days,
		"history_days":  historyDays,
		"products":      products,
	})
	if err != nil {
		slog.Debug("failed to call forecast service for recommendations", "error", err, "forecast_days", days, "history_days", historyDays)
		return nil, err
	}

	return res, nil
}

func (s *ForecastService) GetForecastMonthly(ctx context.Context, days int, historyDays int) ([]model.MonthlyPoint, error) {
	products, err := s.repository.GetProductsWithSales(ctx, historyDays)
	if err != nil {
		slog.Debug("failed to get products with sales for monthly forecast", "error", err, "history_days", historyDays)
		return nil, err
	}

	res, err := callForecast[model.MonthlyPoint](ctx, s.forecastURL+"/forecast/monthly", map[string]any{
		"forecast_days": days,
		"history_days":  historyDays,
		"products":      products,
	})
	if err != nil {
		slog.Debug("failed to call forecast service for monthly forecast", "error", err, "forecast_days", days, "history_days", historyDays)
		return nil, err
	}

	return res, nil
}

func callForecast[T any](ctx context.Context, url string, body any) ([]T, error) {
	data, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("callForecast: marshal: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("callForecast: build request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}


	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("callForecast: do request: %w", err)
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("callForecast: unexpected status: %d", resp.StatusCode)
	}

	var result []T
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("callForecast: decode response: %w", err)
	}

	return result, nil
}