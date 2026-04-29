package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/AVGsync/analysis-pro/backend/internal/model"
	"github.com/AVGsync/analysis-pro/backend/internal/model/request"
	"github.com/AVGsync/analysis-pro/backend/internal/model/response"
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

// RegisterNewUser godoc
//
// @Summary Зарегистрировать нового пользователя
// @Description Создаёт аккаунт по полному имени, email и паролю.
// @Description Email должен быть уникальным. Пароль хранится в виде хеша и никогда не возвращается в ответе.
// @Description При успехе возвращает профиль созданного пользователя без токена; после регистрации вызовите /auth/login.
// @Tags Авторизация
// @Accept json
// @Produce json
// @Param request body request.NewUserRequest true "Данные регистрации: полное имя, email и пароль. Примеры значений указаны в схеме."
// @Success 200 {object} response.UserResponse "Профиль созданного пользователя"
// @Failure 400 {string} string "Некорректное тело запроса"
// @Failure 500 {string} string "Не удалось зарегистрировать пользователя"
// @Router /auth/register [post]
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

// LoginUser godoc
//
// @Summary Войти в аккаунт
// @Description Проверяет email и пароль пользователя.
// @Description При успехе устанавливает JWT в HttpOnly cookie с именем `token`.
// @Description Защищённые маршруты используют cookie `token`; в DEBUG режиме также принимается заголовок `Authorization: Bearer <jwt>`.
// @Tags Авторизация
// @Accept json
// @Produce plain
// @Param request body request.LoginRequest true "Данные входа: email и пароль. Примеры значений указаны в схеме."
// @Success 200 {string} string "OK"
// @Header 200 {string} Set-Cookie "token=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400"
// @Failure 400 {string} string "Некорректное тело запроса"
// @Failure 401 {string} string "Неверный email или пароль"
// @Router /auth/login [post]
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

// GetMe godoc
//
// @Summary Получить профиль текущего пользователя
// @Description Возвращает профиль пользователя, определённого по JWT claims.
// @Description Требует валидную cookie `token`, полученную через /auth/login. В DEBUG режиме также принимается `Authorization: Bearer <jwt>`.
// @Tags Пользователи
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.UserResponse "Профиль текущего пользователя"
// @Failure 401 {string} string "Пользователь не авторизован"
// @Failure 500 {string} string "Claims не найдены в контексте"
// @Failure 500 {string} string "Не удалось получить пользователя"
// @Router /me [get]
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

// UpdateUser godoc
//
// @Summary Обновить профиль текущего пользователя
// @Description Обновляет email и/или полное имя текущего пользователя.
// @Description Все поля необязательные. Если поле не передано, прежнее значение сохраняется.
// @Description Требует валидную cookie `token`, полученную через /auth/login. В DEBUG режиме также принимается `Authorization: Bearer <jwt>`.
// @Tags Пользователи
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body request.UserUpdateRequest true "Данные обновления профиля: email и/или полное имя. Примеры значений указаны в схеме."
// @Success 200 {object} response.UserResponse "Обновлённый профиль пользователя"
// @Failure 400 {string} string "Некорректное тело запроса"
// @Failure 401 {string} string "Пользователь не авторизован"
// @Failure 500 {string} string "Claims не найдены в контексте"
// @Failure 500 {string} string "Не удалось обновить пользователя"
// @Router /me [patch]
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
