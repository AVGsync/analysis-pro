package postgres

import (
	"context"
	"fmt"

	"github.com/AVGsync/analysis-pro/backend/internal/model"
	"github.com/AVGsync/analysis-pro/backend/internal/model/response"
)

type UserRepository struct {
	database *DB
}

func (r *UserRepository) RegisterNewUser(user *model.User, ctx context.Context) (response.UserResponse, error) {
	u := response.UserResponse{}

	err := r.database.db.QueryRowContext(ctx, `
		INSERT INTO users (full_name, email, password_hash, role, subscription_plan, subscription_expires)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, full_name, email, role, subscription_plan, subscription_expires
	`, user.FullName, user.Email, user.PasswordHash, user.Role, user.SubscriptionPlan, user.SubscriptionExpires).Scan(
		&u.ID, 
		&u.Fullname, 
		&u.Email, 
		&u.Role, 
		&u.SubscriptionPlan, 
		&u.SubscriptionExpires,
	)
	if err != nil {
		return u, fmt.Errorf("user repository: register new user: %w", err)
	}
	return u, err
}

func (r *UserRepository) UpdateUser(user *model.User, ctx context.Context) (response.UserResponse,error) {
	u := response.UserResponse{}
	  err := r.database.db.QueryRowContext(ctx, `
		UPDATE users
		SET full_name = $2, email = $3, role = $4, subscription_plan = $5, subscription_expires = $6
		WHERE id = $1
		RETURNING id, full_name, email, role, subscription_plan, subscription_expires
	`, user.ID, user.FullName, user.Email, user.Role, user.SubscriptionPlan, user.SubscriptionExpires).Scan(
		&u.ID, 
		&u.Fullname, 
		&u.Email, 
		&u.Role, 
		&u.SubscriptionPlan, 
		&u.SubscriptionExpires,
	)
	if err != nil {
		return response.UserResponse{}, fmt.Errorf("user repository: update user: %w", err)
	}
	return u, nil
}

func (r *UserRepository) GetUserByEmail(email string, ctx context.Context) (model.User, error) {
	var user model.User
	err := r.database.db.QueryRowContext(ctx, `
		SELECT id, full_name, email, password_hash, role, subscription_plan, subscription_expires
		FROM users
		WHERE email = $1
	`, email).Scan(
		&user.ID, 
		&user.FullName, 
		&user.Email, 
		&user.PasswordHash, 
		&user.Role, 
		&user.SubscriptionPlan, 
		&user.SubscriptionExpires,
	)
	if err != nil {
		return user, fmt.Errorf("user repository: get user by email: %w", err)
	}
	return user, nil
}

func (r *UserRepository) GetUserByID(id string, ctx context.Context) (model.User, error) {
	var user model.User
	err := r.database.db.QueryRowContext(ctx, `
		SELECT id, full_name, email, password_hash, role, subscription_plan, subscription_expires
		FROM users
		WHERE id = $1
	`, id).Scan(
		&user.ID, 
		&user.FullName, 
		&user.Email, 
		&user.PasswordHash, 
		&user.Role, 
		&user.SubscriptionPlan, 
		&user.SubscriptionExpires,
	)
	if err != nil {
		return user, fmt.Errorf("user repository: get user by ID: %w", err)
	}
	return user, nil
}
