package service

import (
	"context"

	"github.com/AVGsync/analysis-pro/backend/internal/model"
	"github.com/AVGsync/analysis-pro/backend/internal/model/request"
	"github.com/AVGsync/analysis-pro/backend/internal/model/response"
)

type UserRepository interface {
	RegisterNewUser(user *model.User, ctx context.Context) (response.UserResponse, error)
	GetUserByEmail(email string, ctx context.Context) (model.User, error)
}

type Hasher interface {
	HashPassword(password string) (string, error)
	CheckPassword(plain, hashed string) bool
}

type JWTManager interface {
	Generate(userID string, role string) (string, error)
}

type UserService struct {
	repository UserRepository
	hasher Hasher
	jwtManager JWTManager
}

func NewUserService(repository UserRepository, hasher Hasher, jwtManager JWTManager) *UserService {
	return &UserService{
		repository: repository,
		hasher: hasher,
		jwtManager: jwtManager,
	}
}

func (s *UserService) RegisterNewUser(user *request.NewUserRequest, ctx context.Context) (response.UserResponse, error) {
	hashed_password, err := s.hasher.HashPassword(user.Password)
	if err != nil {
		return response.UserResponse{}, err
	}

	u := model.User{
		FullName: user.FullName,
		Email: user.Email,
		Role: "user",
		PasswordHash: hashed_password,
	}
	return s.repository.RegisterNewUser(&u, ctx)
}

func (s *UserService) AuthenticateUser(req request.LoginRequest, ctx context.Context) (string, error) {
	user, err := s.repository.GetUserByEmail(req.Email, ctx)
	if err != nil {
		return "", err
	}

	if !s.hasher.CheckPassword(req.Password, user.PasswordHash) {
		return "", err
	}

	token, err := s.jwtManager.Generate(user.ID, user.Role)
	if err != nil {
		return "", err
	}

	return token, nil
}
