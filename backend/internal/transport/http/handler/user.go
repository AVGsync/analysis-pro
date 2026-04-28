package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/AVGsync/analysis-pro/backend/internal/model/request"
	"github.com/AVGsync/analysis-pro/backend/internal/model/response"
	"github.com/AVGsync/analysis-pro/backend/internal/model"
)

type UserUseCase interface {
	RegisterNewUser(user *request.NewUserRequest, ctx context.Context) (response.UserResponse, error)
	AuthenticateUser(req request.LoginRequest, ctx context.Context) (string, error)
	GetUserByID(id string, ctx context.Context) (response.UserResponse, error)
	UpdateUser(user *request.UserUpdateRequest, ctx context.Context) (response.UserResponse, error)
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

func (h *UserHandler) GetMe() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims, ok := r.Context().Value("claims").(*model.Claims)
		if !ok {
			http.Error(w, "claims not found in context", http.StatusInternalServerError)
			return
		}

		user, err := h.useCase.GetUserByID(claims.UserID, r.Context())
		if err != nil {
			http.Error(w, "failed to get user", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
	}
}

func (h *UserHandler) UpdateUser() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, ok := r.Context().Value("claims").(*model.Claims)
		if !ok {
			http.Error(w, "claims not found in context", http.StatusInternalServerError)
			return
		}

		u := &request.UserUpdateRequest{}
		if err := json.NewDecoder(r.Body).Decode(u); err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}

		user, err := h.useCase.UpdateUser(u, r.Context())
		if err != nil {
			http.Error(w, "failed to update user", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
	}
}