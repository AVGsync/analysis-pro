package apiserver

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"github.com/AVGsync/analysis-pro/backend/internal/repository/postgres"
	"github.com/go-chi/chi/v5"
)

type APIServer struct {
	config *Config
	logger *slog.Logger
	router *chi.Mux
	db     *postgres.DB
}

func New(config *Config) (*APIServer, error) {
	logger, err := newLogger(config.LogLevel)
	if err != nil {
		return nil, fmt.Errorf("apiserver: configure logger: %w", err)
	}

	return &APIServer{
		config: config,
		logger: logger,
		router: chi.NewRouter(),
	}, nil
}

func (s *APIServer) Start() error {
	if err := s.configureDB(); err != nil {
		return fmt.Errorf("apiserver: configure database: %w", err)
	}

	s.configureRouter()

	slog.Info("Starting api server",
		"bind_addr", s.config.BindAddr,
		"log_level", s.config.LogLevel,
	)

	return http.ListenAndServe(s.config.BindAddr, s.router)
}

func newLogger(levelStr string) (*slog.Logger, error) {
	var level slog.Level
	if err := level.UnmarshalText([]byte(levelStr)); err != nil {
		return nil, fmt.Errorf("unknown log level %q: %w", levelStr, err)
	}

	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: level,
	}))
	slog.SetDefault(logger)
	return logger, nil 
}

func (s *APIServer) configureDB() error {
	s.db = postgres.New(s.config.DatabaseURL())

	if err := s.db.Open(); err != nil {
		return fmt.Errorf("open database connection: %w", err)
	}
	return nil
}

func (s *APIServer) configureRouter() {

	s.router.Route("/api", func(r chi.Router) {
		r.Get("/ping", func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte("pong"))
		})
	})
}