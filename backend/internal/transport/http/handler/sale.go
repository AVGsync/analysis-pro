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