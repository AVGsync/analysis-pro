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

func (j *JWTManager) Generate(userID string, role string, subscriptionPlan string) (string, error) {
    claims := model.Claims{
        UserID: userID,
        Role:   role,
        SubscriptionPlan: subscriptionPlan,
				
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

func (j *JWTManager) Validate(tokenStr string) (*model.Claims, error) {
    token, err := jwt.ParseWithClaims(
        tokenStr,
        &model.Claims{}, 
        func(t *jwt.Token) (any, error) {
            if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
            }
            return j.secret, nil 
        },
    )
    if err != nil {
        return nil, fmt.Errorf("jwt: parse: %w", err)
    }

    claims, ok := token.Claims.(*model.Claims)
    if !ok || !token.Valid {
        return nil, fmt.Errorf("jwt: invalid claims")
    }

    return claims, nil
}