package middleware

import (
	"context"
	"log/slog"
	"net/http"
	"time"

	"github.com/AVGsync/analysis-pro/backend/internal/model"
)

type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func newResponseWriter(w http.ResponseWriter) *responseWriter {
	return &responseWriter{w, http.StatusOK}
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

type JWTManager interface {
	Validate(tokenStr string) (*model.Claims, error)
}

type Middleware struct{
	jwtManager JWTManager
}

func NewMiddleware(jwtmanager JWTManager) *Middleware {
	return &Middleware{
		jwtManager: jwtmanager,
	}
}

func (m *Middleware) Trace(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rw := newResponseWriter(w)
		start := time.Now()

		slog.Debug(">>> incoming request",
			"method", r.Method,
			"path", r.URL.Path,
			"remote_addr", r.RemoteAddr,
		)

		next.ServeHTTP(rw, r)

		slog.Info("<<< done request",
			"method", r.Method,
			"path", r.URL.Path,
			"status", rw.statusCode,
			"latency_ms", time.Since(start).Milliseconds(),
		)
	})
}

func (m *Middleware) Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("token")
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			slog.Debug("no token cookie", "error", err)
			return
		}

		claims, err := m.jwtManager.Validate(cookie.Value)
		if err != nil {
			http.SetCookie(w, &http.Cookie{
				Name:   "token",
				MaxAge: -1,
			})
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			slog.Debug("invalid token", "error", err)
			return
		}

		ctx := context.WithValue(r.Context(), "claims", claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}