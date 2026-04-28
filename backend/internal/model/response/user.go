package response

type UserResponse struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Fullname string `json:"full_name"`
	Role     string `json:"role"`
}