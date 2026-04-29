package request

type NewUserRequest struct {
	// Полное имя пользователя, отображается в профиле.
	FullName string `json:"full_name" validate:"required,min=3,max=64" example:"Иван Петров"`
	// Уникальный email, используется для входа.
	Email string `json:"email" validate:"required,email" example:"ivan.petrov@example.com"`
	// Пароль, минимум 8 символов.
	Password string `json:"password" validate:"required,min=8" example:"Str0ngPass!2026"`
}

type LoginRequest struct {
	// Email зарегистрированного пользователя.
	Email string `json:"email" validate:"required,email" example:"ivan.petrov@example.com"`
	// Пароль пользователя.
	Password string `json:"password" validate:"required" example:"Str0ngPass!2026"`
}

type UserUpdateRequest struct {
	// Новый email. Если поле не передано, текущее значение не меняется.
	Email *string `json:"email,omitempty" validate:"omitempty,email" example:"ivan.new@example.com"`
	// Новое полное имя. Если поле не передано, текущее значение не меняется.
	Fullname *string `json:"full_name,omitempty" validate:"omitempty,min=3,max=64" example:"Иван Сергеевич Петров"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" validate:"required" example:"Str0ngPass!2026"`
	NewPassword string `json:"new_password" validate:"required,min=8" example:"N3wStr0ngPass!2026"`
}
