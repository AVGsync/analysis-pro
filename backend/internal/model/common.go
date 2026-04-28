package model

import "github.com/golang-jwt/jwt/v5"

type User struct {
	ID			 string `json:"id"`
	FullName string `json:"full_name"`
	Email    string `json:"email"`
	PasswordHash string `json:"password_hash"`
	Role     string `json:"role"`
}

type Claims struct {
    UserID string `json:"user_id"`
    Role   string `json:"role"`

    jwt.RegisteredClaims
}