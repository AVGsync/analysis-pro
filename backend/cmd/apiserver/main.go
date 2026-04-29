package main

import (
	"github.com/AVGsync/analysis-pro/backend/internal/app/apiserver"
)

// @title API Analysis Pro
// @version 1.0
// @description REST API для Analysis Pro: авторизация, профиль пользователя, детализация продаж, прогнозы по товарам, рекомендации по закупкам и экспорт CSV/XML.
// @description
// @description Схема авторизации: вызовите `POST /auth/login`; API установит HttpOnly cookie `token`. В DEBUG режиме также можно передавать `Authorization: Bearer <jwt>`.
// @description Swagger UI доступен только при `DEBUG=true`: `/swagger`, JSON спецификация — `/swagger/doc.json`.
// @BasePath /api
// @schemes http
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Только для DEBUG режима. Введите: Bearer {token}
func main() {
	config, err := apiserver.NewConfig()
	if err != nil {
		panic(err)
	}

	s, err := apiserver.New(config)
	if err != nil {
		panic(err)
	}

	if err := s.Start(); err != nil {
		panic(err)
	}
}
