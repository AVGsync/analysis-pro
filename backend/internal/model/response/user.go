package response

import "time"

type UserResponse struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Fullname string `json:"full_name"`
	Role     string `json:"role"`
	SubscriptionPlan string `json:"subscription_plan"`
	SubscriptionExpires *time.Time `json:"subscription_expires,omitempty"`
}