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
// @Description Запрос использует JSON body с необязательными датами `from` и `to` в формате `YYYY-MM-DD`.
// @Description Пустое тело `{}` возвращает все доступные продажи. Требует валидную cookie `token`.
// @Tags Товары
// @Accept json
// @Produce json
// @Security CookieAuth
// @Param request body request.DetailsSaleRequest true "Необязательный фильтр по датам. Примеры значений указаны в схеме."
// @Success 200 {array} model.SaleDetail "Строки детализации продаж"
// @Failure 400 {string} string "Некорректное тело запроса"
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

		req := request.DetailsSaleRequest{}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
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
