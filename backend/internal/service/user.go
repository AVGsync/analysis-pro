package service

import (
	"context"
	"log/slog"

	"github.com/AVGsync/analysis-pro/backend/internal/model"
	"github.com/AVGsync/analysis-pro/backend/internal/model/request"
	"github.com/AVGsync/analysis-pro/backend/internal/model/response"
)

type UserRepository interface {
	RegisterNewUser(user *model.User, ctx context.Context) (response.UserResponse, error)
	GetUserByEmail(email string, ctx context.Context) (model.User, error)
	GetUserByID(id string, ctx context.Context) (model.User, error)
	UpdateUser(user *model.User, ctx context.Context) (response.UserResponse, error)
}

type Hasher interface {
	HashPassword(password string) (string, error)
	CheckPassword(plain, hashed string) bool
}

type JWTManager interface {
	Generate(userID string, role string, subscriptionPlan string) (string, error)
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
		slog.Debug("failed to hash password", "error", err)
		return response.UserResponse{}, err
	}

	u := model.User{
		FullName: user.FullName,
		Email: user.Email,
		Role: "user",
		PasswordHash: hashed_password,
		SubscriptionPlan: "free",
		SubscriptionExpires: nil,
	}

	res, err := s.repository.RegisterNewUser(&u, ctx)
	if err != nil {
		slog.Debug("failed to register new user", "error", err, "email", user.Email)
		return response.UserResponse{}, err
	}
	return res, nil
}

func (s *UserService) AuthenticateUser(req request.LoginRequest, ctx context.Context) (string, error) {
	user, err := s.repository.GetUserByEmail(req.Email, ctx)
	if err != nil {
		slog.Debug("failed to get user by email", "error", err, "email", req.Email)
		return "", err
	}

	if !s.hasher.CheckPassword(req.Password, user.PasswordHash) {
		slog.Debug("password check failed", "error", err, "email", req.Email)
		return "", err
	}

	token, err := s.jwtManager.Generate(user.ID, user.Role, user.SubscriptionPlan)
	if err != nil {
		slog.Debug("failed to generate JWT token", "error", err, "user_id", user.ID)
		return "", err
	}

	return token, nil
}

func (s *UserService) GetUserByID(id string, ctx context.Context) (response.UserResponse, error) {
	u, err := s.repository.GetUserByID(id, ctx)
	if err != nil {
		slog.Debug("failed to get user by ID", "error", err, "user_id", id)
		return response.UserResponse{}, err
	}

	return response.UserResponse{
		ID: u.ID,
		Email: u.Email,
		Fullname: u.FullName,
		Role: u.Role,
		SubscriptionPlan: u.SubscriptionPlan,
		SubscriptionExpires: u.SubscriptionExpires,
	}, nil
}

func (s *UserService) UpdateUser(req *request.UserUpdateRequest, ctx context.Context) (response.UserResponse, error) {
	userId := ctx.Value("claims").(*model.Claims).UserID

	existingUser, err := s.repository.GetUserByID(userId, ctx)
	if err != nil {
		slog.Debug("failed to get user by ID for update", "error", err, "user_id", userId)
		return response.UserResponse{}, err
	}

	if req.Email != nil {
		existingUser.Email = *req.Email
	}
	if req.Fullname != nil {
		existingUser.FullName = *req.Fullname
	}

	u, err := s.repository.UpdateUser(&existingUser, ctx)
	if err != nil {
		slog.Debug("failed to update user", "error", err, "user_id", existingUser.ID)
		return response.UserResponse{}, err
	}
	return u, nil
}
