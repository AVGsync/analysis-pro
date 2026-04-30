package service

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/AVGsync/analysis-pro/backend/internal/model"
	"github.com/AVGsync/analysis-pro/backend/internal/model/request"
	"github.com/AVGsync/analysis-pro/backend/internal/model/response"
)

type fakeUserRepo struct {
	user model.User
}

func (r fakeUserRepo) RegisterNewUser(user *model.User, ctx context.Context) (response.UserResponse, error) {
	return response.UserResponse{}, nil
}

func (r fakeUserRepo) GetUserByEmail(email string, ctx context.Context) (model.User, error) {
	if email != r.user.Email {
		return model.User{}, errors.New("not found")
	}
	return r.user, nil
}

func (r fakeUserRepo) GetUserByID(id string, ctx context.Context) (model.User, error) {
	return r.user, nil
}

func (r fakeUserRepo) UpdateUser(user *model.User, ctx context.Context) (response.UserResponse, error) {
	return response.UserResponse{}, nil
}

type fakeHasher struct{}

func (fakeHasher) HashPassword(password string) (string, error) {
	return "hash:" + password, nil
}

func (fakeHasher) CheckPassword(plain, hashed string) bool {
	return hashed == "hash:"+plain
}

type fakeJWT struct{}

func (fakeJWT) Generate(userID string, role string, subscriptionPlan string) (string, error) {
	return "token", nil
}

func TestAuthenticateUserReturnsErrorOnWrongPassword(t *testing.T) {
	svc := NewUserService(
		fakeUserRepo{user: model.User{
			ID:                  "user-id",
			Email:               "example@example.com",
			PasswordHash:        "hash:correct-password",
			Role:                "user",
			SubscriptionPlan:    "free",
			SubscriptionExpires: (*time.Time)(nil),
		}},
		fakeHasher{},
		fakeJWT{},
	)

	token, err := svc.AuthenticateUser(request.LoginRequest{
		Email:    "example@example.com",
		Password: "wrong-password",
	}, context.Background())

	if !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("err = %v, want ErrInvalidCredentials", err)
	}
	if token != "" {
		t.Fatalf("token = %q, want empty", token)
	}
}
