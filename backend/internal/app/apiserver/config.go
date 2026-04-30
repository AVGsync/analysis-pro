package apiserver

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	BindAddr string    `envconfig:"BIND_ADDR" default:":8080"`
	LogLevel string    `envconfig:"LOG_LEVEL" default:"info"`
	Debug    bool      `envconfig:"DEBUG" default:"false"`
	JWTSecret string `envconfig:"JWT_SECRET" required:"true"`
	TTLAccessToken  int64  `envconfig:"TTL_ACCESS_TOKEN" default:"3600"` 
	PostgresUser		 string `envconfig:"POSTGRES_USER" default:"postgres"`
	PostgresPassword string `envconfig:"POSTGRES_PASSWORD" default:"postgres"`
	PostgresHost     string `envconfig:"POSTGRES_HOST" default:"localhost"`
	PostgresPort     string `envconfig:"POSTGRES_PORT" default:"5432"`
	PostgresDB   string `envconfig:"POSTGRES_DB" default:"analysis"`
}


func (c *Config) DatabaseURL() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		c.PostgresHost,
		c.PostgresPort,
		c.PostgresUser,
		c.PostgresPassword,
		c.PostgresDB,
	)
}

func NewConfig() (*Config, error) {
    if err := loadEnv(); err != nil {
        fmt.Fprintf(os.Stderr, "warn: .env not found: %v\n", err)
    }

    var cfg Config
    if err := envconfig.Process("", &cfg); err != nil {
        return nil, fmt.Errorf("config: process env: %w", err)
    }
    return &cfg, nil
}

func loadEnv() error {
    dir, err := os.Getwd()
    if err != nil {
        return err
    }

    for i := 0; i < 3; i++ {
        envPath := filepath.Join(dir, ".env")
        if _, err := os.Stat(envPath); err == nil {
            return godotenv.Load(envPath)
        }
        dir = filepath.Dir(dir) 
    }

    return fmt.Errorf(".env not found")
}