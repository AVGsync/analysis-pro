package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/AVGsync/analysis-pro/backend/internal/model"
	"github.com/AVGsync/analysis-pro/backend/internal/model/request"
)

type SaleUseCase interface {
	GetSaleDetails(ctx context.Context, req request.DetailsSaleRequest) ([]model.SaleDetail, error)
}

type SaleHandler struct {
	useCase SaleUseCase
}

func NewSaleHandler(useCase SaleUseCase) *SaleHandler {
	return &SaleHandler{
		useCase: useCase,
	}
}

// GetSaleDetails godoc
//
// @Summary Получить детализацию продаж
// @Description Возвращает продажи товаров, сгруппированные по дате продажи, товару и категории.
// @Description Фильтр периода передаётся query-параметрами `from` и `to` в формате `YYYY-MM-DD`.
// @Description Если `from` не передан, используется дата месяц назад. Если `to` не передан, используется текущая дата.
// @Description Требует валидную cookie `token`.
// @Tags Товары
// @Produce json
// @Security CookieAuth
// @Param from query string false "Начало периода включительно в формате YYYY-MM-DD. Пример: 2026-02-01."
// @Param to query string false "Конец периода включительно в формате YYYY-MM-DD. Пример: 2026-04-30."
// @Success 200 {array} model.SaleDetail "Строки детализации продаж"
// @Failure 400 {string} string "Некорректные query-параметры"
// @Failure 401 {string} string "Пользователь не авторизован"
// @Failure 500 {string} string "Claims не найдены в контексте"
// @Failure 500 {string} string "Не удалось получить детализацию продаж"
// @Router /products/sell-detail [get]
func (h *SaleHandler) GetSaleDetails() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, ok := r.Context().Value("claims").(*model.Claims)
		if !ok {
			http.Error(w, "claims not found in context", http.StatusInternalServerError)
			return
		}

		req := request.DetailsSaleRequest{
			From: r.URL.Query().Get("from"),
			To:   r.URL.Query().Get("to"),
		}
		

		sales, err := h.useCase.GetSaleDetails(r.Context(), req)
		if err != nil {
			http.Error(w, "failed to get sale details", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(sales)
	}
}
