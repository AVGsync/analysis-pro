package middleware

import (
	"context"
	"log/slog"
	"net/http"
	"strings"
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

type Middleware struct {
	jwtManager JWTManager
	debug      bool
}

func NewMiddleware(jwtmanager JWTManager, debug bool) *Middleware {
	return &Middleware{
		jwtManager: jwtmanager,
		debug:      debug,
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
		tokens := m.tokenCandidates(r)
		if len(tokens) == 0 {
			slog.Debug("no token", "path", r.URL.Path)
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		var lastErr error
		for _, token := range tokens {
			claims, err := m.jwtManager.Validate(token.value)
			if err == nil {
				slog.Debug("auth token accepted", "source", token.source)
				ctx := context.WithValue(r.Context(), "claims", claims)
				next.ServeHTTP(w, r.WithContext(ctx))
				return
			}
			lastErr = err
		}

		slog.Debug("invalid token", "error", lastErr)
		http.SetCookie(w, &http.Cookie{Name: "token", MaxAge: -1})
		http.Error(w, "unauthorized", http.StatusUnauthorized)
	})
}

type tokenCandidate struct {
	source string
	value  string
}

func (m *Middleware) tokenCandidates(r *http.Request) []tokenCandidate {
	tokens := make([]tokenCandidate, 0, 2)

	if cookie, err := r.Cookie("token"); err == nil && cookie.Value != "" {
		tokens = append(tokens, tokenCandidate{source: "cookie", value: cookie.Value})
	}

	if !m.debug {
		return tokens
	}

	authHeader := strings.TrimSpace(r.Header.Get("Authorization"))
	const bearerPrefix = "Bearer "
	if len(authHeader) > len(bearerPrefix) && strings.EqualFold(authHeader[:len(bearerPrefix)], bearerPrefix) {
		token := strings.TrimSpace(authHeader[len(bearerPrefix):])
		if token != "" {
			tokens = append(tokens, tokenCandidate{source: "authorization_header", value: token})
		}
	}

	return tokens
}
