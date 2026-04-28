package model

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type User struct {
	ID			 						string `json:"id"`
	FullName 						string `json:"full_name"`
	Email    						string `json:"email"`
	PasswordHash 				string `json:"password_hash"`
	Role     						string `json:"role"`
	SubscriptionPlan    string `json:"subscription_plan"`
	SubscriptionExpires *time.Time `json:"subscription_expires"`
}

type Claims struct {
    UserID string `json:"user_id"`
    Role   string `json:"role"`
		SubscriptionPlan string `json:"subscription_plan"`

    jwt.RegisteredClaims
}

type SaleDetail struct {
	SoldAt      time.Time `json:"sold_at"`
	ProductName string    `json:"product_name"`
	Category    string    `json:"category"`
	Quantity    int       `json:"quantity"`
	Revenue     float64   `json:"revenue"`
}