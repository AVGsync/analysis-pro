package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/AVGsync/analysis-pro/backend/internal/model/request"
	"github.com/AVGsync/analysis-pro/backend/internal/model/response"
)

type UserUseCase interface {
	RegisterNewUser(user *request.NewUserRequest, ctx context.Context) (response.UserResponse, error)
	AuthenticateUser(req request.LoginRequest, ctx context.Context) (string, error)
}

type UserHandler struct {
	useCase UserUseCase
}

func NewUserHandler(useCase UserUseCase) *UserHandler {
	return &UserHandler{
		useCase: useCase,
	}
}

func (h *UserHandler) RegisterNewUser() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		u := &request.NewUserRequest{}
		if err := json.NewDecoder(r.Body).Decode(u); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		user, err := h.useCase.RegisterNewUser(u, r.Context())
		if err != nil {
			http.Error(w, "failed to register new user", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
	}
}

func (h *UserHandler) LoginUser() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		u := &request.LoginRequest{}
		if err := json.NewDecoder(r.Body).Decode(u); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		token, err := h.useCase.AuthenticateUser(*u, r.Context())
		if err != nil {
			http.Error(w, "invalid email or password", http.StatusUnauthorized)
			return
		}

		http.SetCookie(w, &http.Cookie{
				Name:     "token",
				Value:    token,
				HttpOnly: true,                  
				Secure:   true,                    
				SameSite: http.SameSiteStrictMode, 
				Path:     "/",
				MaxAge:   60 * 60 * 24,            
		})

		w.WriteHeader(http.StatusOK)
	}
}