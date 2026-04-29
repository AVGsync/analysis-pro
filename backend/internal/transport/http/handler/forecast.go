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

// GetForecast godoc
//
// @Summary Получить прогноз продаж по товарам
// @Description Строит прогноз спроса по каждому товару на указанный горизонт.
// @Description Сервер загружает историю продаж товаров из PostgreSQL и вызывает сервис прогнозирования.
// @Description Метод прогноза может быть `ARIMA(7,1,1)`, `mean_fallback` или `no_data`.
// @Description Требует валидную cookie `token`. В DEBUG режиме также принимается `Authorization: Bearer <jwt>`.
// @Tags Прогноз
// @Produce json
// @Security BearerAuth
// @Param days query int false "Горизонт прогноза в днях. По умолчанию: 30." default(30) minimum(1) maximum(365)
// @Param history query int false "Период истории продаж в днях. По умолчанию: 90." default(90) minimum(1) maximum(730)
// @Success 200 {array} model.ForecastDetail "Прогноз по каждому товару с разбивкой по дням"
// @Failure 401 {string} string "Пользователь не авторизован"
// @Failure 500 {string} string "Claims не найдены в контексте"
// @Failure 500 {string} string "Не удалось получить прогноз"
// @Router /products/forecast [get]
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

// GetRecommendations godoc
//
// @Summary Получить рекомендации по закупкам
// @Description Возвращает товары, у которых прогнозный спрос превышает текущий остаток.
// @Description `recommend_order` равен прогнозному спросу минус текущий остаток.
// @Description `urgency` зависит от запаса в днях: `high` <= 7 дней, `medium` <= 14 дней, иначе `ok`.
// @Description Требует валидную cookie `token`. В DEBUG режиме также принимается `Authorization: Bearer <jwt>`.
// @Tags Прогноз
// @Produce json
// @Security BearerAuth
// @Param days query int false "Горизонт прогноза в днях. По умолчанию: 30." default(30) minimum(1) maximum(365)
// @Param history query int false "Период истории продаж в днях. По умолчанию: 90." default(90) minimum(1) maximum(730)
// @Success 200 {array} model.RecommendationItem "Список рекомендаций по закупкам, отсортированный по срочности"
// @Failure 401 {string} string "Пользователь не авторизован"
// @Failure 500 {string} string "Claims не найдены в контексте"
// @Failure 500 {string} string "Не удалось получить рекомендации"
// @Router /products/recommendations [get]
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

// GetForecastMonthly godoc
//
// @Summary Получить помесячный прогноз
// @Description Агрегирует прогнозное количество продаж и прогнозную выручку по месяцам.
// @Description Используется для графиков и верхнеуровневого планирования выручки.
// @Description Требует валидную cookie `token`. В DEBUG режиме также принимается `Authorization: Bearer <jwt>`.
// @Tags Прогноз
// @Produce json
// @Security BearerAuth
// @Param days query int false "Горизонт прогноза в днях. По умолчанию: 30." default(30) minimum(1) maximum(365)
// @Param history query int false "Период истории продаж в днях. По умолчанию: 90." default(90) minimum(1) maximum(730)
// @Success 200 {array} model.MonthlyPoint "Итоги прогноза, сгруппированные по месяцам"
// @Failure 401 {string} string "Пользователь не авторизован"
// @Failure 500 {string} string "Claims не найдены в контексте"
// @Failure 500 {string} string "Не удалось получить помесячный прогноз"
// @Router /products/forecast/monthly [get]
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
