package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/AVGsync/analysis-pro/backend/internal/model"
)

type ForecastUseCase interface {
	GetForecast(ctx context.Context, days int, historyDays int) ([]model.ForecastDetail, error)
	GetRecommendations(ctx context.Context, days int, historyDays int) ([]model.RecommendationItem, error)
	GetForecastMonthly(ctx context.Context, days int, historyDays int) ([]model.MonthlyPoint, error)
}

type ForecastHandler struct {
	useCase ForecastUseCase
}

func NewForecastHandler(useCase ForecastUseCase) *ForecastHandler {
	return &ForecastHandler{
		useCase: useCase,
	}
}

func (h *ForecastHandler) GetForecast() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, ok := r.Context().Value("claims").(*model.Claims)
		if !ok {
			http.Error(w, "claims not found in context", http.StatusInternalServerError)
			return
		}

		days, err := strconv.Atoi(r.URL.Query().Get("days"))
		if err != nil {
			days = 30 
		}

		history, err := strconv.Atoi(r.URL.Query().Get("history"))
		if err != nil {
			history = 90
		}


		forecast, err := h.useCase.GetForecast(r.Context(), days, history)
		if err != nil {
			http.Error(w, "failed to get forecast", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(forecast)
	}
}

func (h *ForecastHandler) GetRecommendations() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, ok := r.Context().Value("claims").(*model.Claims)
		if !ok {
			http.Error(w, "claims not found in context", http.StatusInternalServerError)
			return
		}

		days, err := strconv.Atoi(r.URL.Query().Get("days"))
		if err != nil {
			days = 30 
		}

		history, err := strconv.Atoi(r.URL.Query().Get("history"))
		if err != nil {
			history = 90
		}

		recommendations, err := h.useCase.GetRecommendations(r.Context(), days, history)
		if err != nil {
			http.Error(w, "failed to get recommendations", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(recommendations)
	}
}

func (h *ForecastHandler) GetForecastMonthly() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, ok := r.Context().Value("claims").(*model.Claims)
		if !ok {
			http.Error(w, "claims not found in context", http.StatusInternalServerError)
			return
		}

		days, err := strconv.Atoi(r.URL.Query().Get("days"))
		if err != nil {
			days = 30 
		}

		history, err := strconv.Atoi(r.URL.Query().Get("history"))
		if err != nil {
			history = 90
		}

		forecast, err := h.useCase.GetForecastMonthly(r.Context(), days, history)
		if err != nil {
			http.Error(w, "failed to get monthly forecast", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(forecast)
	}
}