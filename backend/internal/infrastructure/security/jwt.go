package security

import (
    "fmt"
    "time"

    "github.com/AVGsync/analysis-pro/backend/internal/model"
    "github.com/golang-jwt/jwt/v5"
)

type JWTManager struct {
    secret []byte        
    ttl    time.Duration 
}

func NewJWTManager(secret string, ttl time.Duration) *JWTManager {
    return &JWTManager{
        secret: []byte(secret),
        ttl:    ttl,
    }
}

func (j *JWTManager) Generate(userID string, role string) (string, error) {
    claims := model.Claims{
        UserID: userID,
        Role:   role,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(j.ttl)),
            IssuedAt: jwt.NewNumericDate(time.Now()),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

    signed, err := token.SignedString(j.secret)
    if err != nil {
        return "", fmt.Errorf("jwt: sign token: %w", err)
    }

    return signed, nil
}