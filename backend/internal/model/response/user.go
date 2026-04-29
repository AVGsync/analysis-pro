package response

import "time"

type UserResponse struct {
	ID                  string     `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	Email               string     `json:"email" example:"ivan.petrov@example.com"`
	Fullname            string     `json:"full_name" example:"Иван Петров"`
	Role                string     `json:"role" example:"user" enums:"user,admin"`
	SubscriptionPlan    string     `json:"subscription_plan" example:"free" enums:"free,pro,enterprise"`
	SubscriptionExpires *time.Time `json:"subscription_expires,omitempty" example:"2026-12-31T23:59:59Z"`
}
