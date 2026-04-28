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
		INSERT INTO users (full_name, email, password_hash, role)
		VALUES ($1, $2, $3, $4)
		RETURNING id, full_name, email, role
	`, user.FullName, user.Email, user.PasswordHash, user.Role).Scan(&u.ID, &u.Fullname, &u.Email, &u.Role)
	if err != nil {
		return u, fmt.Errorf("user repository: register new user: %w", err)
	}
	return u, err
}

func (r *UserRepository) GetUserByEmail(email string, ctx context.Context) (model.User, error) {
	var user model.User
	err := r.database.db.QueryRowContext(ctx, `
		SELECT id, full_name, email, password_hash, role
		FROM users
		WHERE email = $1
	`, email).Scan(&user.ID, &user.FullName, &user.Email, &user.PasswordHash, &user.Role)
	if err != nil {
		return user, fmt.Errorf("user repository: get user by email: %w", err)
	}
	return user, nil
}