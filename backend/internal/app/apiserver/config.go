package apiserver

import (
	"fmt"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
)

type Config struct {
	BindAddr string    `envconfig:"BIND_ADDR" default:":8080"`
	LogLevel string    `envconfig:"LOG_LEVEL" default:"debug"`
	JWTSecret string `envconfig:"JWT_SECRET" required:"true"`
	TTLAccessToken  int64  `envconfig:"TTL_ACCESS_TOKEN" default:"3600"` 
	PostgresUser		 string `envconfig:"POSTGRES_USER" default:"postgres"`
	PostgresPassword string `envconfig:"POSTGRES_PASSWORD" default:"postgres"`
	PostgresPort     string `envconfig:"POSTGRES_PORT" default:"5432"`
	PostgresDB   string `envconfig:"POSTGRES_DB" default:"analysis"`
}

func (c *Config) DatabaseURL() string {
	return fmt.Sprintf(
		"host=localhost port=%s user=%s password=%s dbname=%s sslmode=disable",
		c.PostgresPort,
		c.PostgresUser,
		c.PostgresPassword,
		c.PostgresDB,
	)
}

func NewConfig() (*Config, error) {
	err := godotenv.Load()
	if err != nil {
		return nil, fmt.Errorf("apiserver: load .env file: %w", err)
	}

	var cfg Config
	if err := envconfig.Process("", &cfg); err != nil {
		return nil, err
	}
	return &cfg, nil
}