package apiserver

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	_ "github.com/AVGsync/analysis-pro/backend/docs"
	"github.com/AVGsync/analysis-pro/backend/internal/infrastructure/security"
	"github.com/AVGsync/analysis-pro/backend/internal/repository/postgres"
	"github.com/AVGsync/analysis-pro/backend/internal/service"
	"github.com/AVGsync/analysis-pro/backend/internal/transport/http/handler"
	"github.com/AVGsync/analysis-pro/backend/internal/transport/http/middleware"

	"github.com/go-chi/chi/v5"
	httpSwagger "github.com/swaggo/http-swagger"
)

type APIServer struct {
	config *Config
	logger *slog.Logger
	router *chi.Mux
	db     *postgres.DB
}

func New(config *Config) (*APIServer, error) {
	logger, err := newLogger(config)
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
		"debug", s.config.Debug,
	)

	return http.ListenAndServe(s.config.BindAddr, s.router)
}

func newLogger(cfg *Config) (*slog.Logger, error) {
	levelStr := cfg.LogLevel

	if cfg.Debug {
		levelStr = "debug"
	}

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
	hasher := security.NewHasher()
	jwtManager := security.NewJWTManager(s.config.JWTSecret, time.Duration(s.config.TTLAccessToken)*time.Second)

	userRepo := s.db.User()
	saleRepo := s.db.Sale()
	forecastRepo := s.db.Forecast()
	exportRepo := s.db.Export()

	userService := service.NewUserService(userRepo, hasher, jwtManager)
	saleService := service.NewSaleService(saleRepo)
	forecastService := service.NewForecastService(s.config.ForecastURL(), forecastRepo)
	exportService := service.NewExportService(exportRepo, forecastService)

	userHandler := handler.NewUserHandler(userService)
	saleHandler := handler.NewSaleHandler(saleService)
	forecastHandler := handler.NewForecastHandler(forecastService)
	exportHandler := handler.NewExportHandler(exportService)

	middleware := middleware.NewMiddleware(jwtManager)

	if s.config.Debug {
		s.router.Get("/swagger", func(w http.ResponseWriter, r *http.Request) {
			http.Redirect(w, r, "/swagger/index.html", http.StatusMovedPermanently)
		})
		s.router.Get("/swagger/*", httpSwagger.WrapHandler)
		slog.Debug("swagger UI enabled", "url", fmt.Sprintf("http://localhost%s/swagger/index.html", s.config.BindAddr))
	}

	s.router.Route("/api", func(r chi.Router) {
		r.Use(middleware.Trace)

		r.Get("/ping", ping)

		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", userHandler.RegisterNewUser())
			r.Post("/login", userHandler.LoginUser())
		})

		r.Group(func(r chi.Router) {
			r.Use(middleware.Auth)

			r.Get("/me", userHandler.GetMe())
			r.Patch("/me", userHandler.UpdateUser())

			r.Route("/products", func(r chi.Router) {
				r.Get("/sell-detail", saleHandler.GetSaleDetails())
				r.Get("/forecast", forecastHandler.GetForecast())
				r.Get("/forecast/monthly", forecastHandler.GetForecastMonthly())
				r.Get("/export/forecast", exportHandler.ExportForecast())
				r.Get("/export/assortment", exportHandler.ExportAssortment())

				r.Get("/recommendations", forecastHandler.GetRecommendations())
			})
		})
	})
}

// ping godoc
//
// @Summary Проверить доступность API сервера
// @Description Лёгкая проверка маршрутизации API сервера.
// @Description Не проверяет доступность PostgreSQL и сервиса прогнозирования.
// @Tags Система
// @Produce plain
// @Success 200 {string} string "pong"
// @Router /ping [get]
func ping(w http.ResponseWriter, _ *http.Request) {
	w.Write([]byte("pong"))
}
