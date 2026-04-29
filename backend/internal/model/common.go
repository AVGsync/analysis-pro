package model

import (
	"encoding/xml"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type User struct {
	ID                  string     `json:"id"`
	FullName            string     `json:"full_name"`
	Email               string     `json:"email"`
	PasswordHash        string     `json:"password_hash"`
	Role                string     `json:"role"`
	SubscriptionPlan    string     `json:"subscription_plan"`
	SubscriptionExpires *time.Time `json:"subscription_expires"`
}

type Claims struct {
	UserID           string `json:"user_id"`
	Role             string `json:"role"`
	SubscriptionPlan string `json:"subscription_plan"`

	jwt.RegisteredClaims
}

type SaleDetail struct {
	SoldAt      time.Time `json:"sold_at" example:"2026-04-29T00:00:00Z"`
	ProductName string    `json:"product_name" example:"iPhone 15"`
	Category    string    `json:"category" example:"Смартфоны"`
	Quantity    int       `json:"quantity" example:"4"`
	Revenue     float64   `json:"revenue" example:"399996.00"`
}

// ------------------ Forecast Models ------------------

type SaleRecord struct {
	SoldAt   string `json:"sold_at" example:"2026-04-20"`
	Quantity int    `json:"quantity" example:"5"`
}

type ProductInput struct {
	ProductID    int          `json:"product_id" example:"4"`
	ProductName  string       `json:"product_name" example:"iPhone 15"`
	SKU          string       `json:"sku" example:"PHONE-IPHONE-15"`
	CurrentStock int          `json:"current_stock" example:"12"`
	Price        float64      `json:"price" example:"99999.00"`
	Sales        []SaleRecord `json:"sales"`
}

// ответ /forecast — детализированный прогноз по товару
type DailyPoint struct {
	Date     string `json:"date" example:"2026-05-01"`
	Quantity int    `json:"quantity" example:"3"`
}

type ForecastDetail struct {
	ProductID      int          `json:"product_id" example:"4"`
	ProductName    string       `json:"product_name" example:"iPhone 15"`
	SKU            string       `json:"sku" example:"PHONE-IPHONE-15"`
	ForecastTotal  int          `json:"forecast_total" example:"38"`
	DailyAvg       float64      `json:"daily_avg" example:"1.27"`
	DailyBreakdown []DailyPoint `json:"daily_breakdown"`
	// Алгоритм прогноза, использованный сервисом прогнозирования: ARIMA(7,1,1), mean_fallback или no_data.
	Method string `json:"method" example:"ARIMA(7,1,1)"`
}

// ответ /recommendations — рекомендации по закупкам
type RecommendationItem struct {
	ProductID      int    `json:"product_id" example:"9"`
	ProductName    string `json:"product_name" example:"AirPods Pro 2"`
	SKU            string `json:"sku" example:"AUDIO-AIRPODS-PRO-2"`
	CurrentStock   int    `json:"current_stock" example:"6"`
	ForecastTotal  int    `json:"forecast_total" example:"42"`
	RecommendOrder int    `json:"recommend_order" example:"36"`
	StockDaysLeft  int    `json:"stock_days_left" example:"4"`
	Urgency        string `json:"urgency" example:"high" enums:"high,medium,ok"`
}

// ответ /forecast/monthly — месячный прогноз для графика
type MonthlyPoint struct {
	Month           string  `json:"month" example:"2026-05-01"`
	ForecastQty     int     `json:"forecast_qty" example:"143"`
	ForecastRevenue float64 `json:"forecast_revenue" example:"8754321.50"`
}

// ----------------------- Export Models -----------------------

// ForecastExportRow — строка экспорта прогноза
type ForecastExportRow struct {
	XMLName        xml.Name `json:"-" xml:"product" swaggerignore:"true"`
	ProductName    string   `json:"product_name" xml:"name" example:"AirPods Pro 2"`
	SKU            string   `json:"sku" xml:"sku" example:"AUDIO-AIRPODS-PRO-2"`
	ForecastTotal  int      `json:"forecast_total" xml:"forecast_total" example:"42"`
	RecommendOrder int      `json:"recommend_order" xml:"recommend_order" example:"36"`
	CurrentStock   int      `json:"current_stock" xml:"current_stock" example:"6"`
	Urgency        string   `json:"urgency" xml:"urgency" example:"high" enums:"high,medium,ok"`
}

// XMLForecast — обёртка для валидного XML документа
type XMLForecast struct {
	XMLName  xml.Name            `xml:"forecast"`
	Products []ForecastExportRow `xml:"products>product"`
}

// AssortmentExportRow — строка экспорта ассортимента
type AssortmentExportRow struct {
	XMLName     xml.Name `json:"-" xml:"product" swaggerignore:"true"`
	ProductName string   `json:"product_name" xml:"name" example:"iPhone 15"`
	SKU         string   `json:"sku" xml:"sku" example:"PHONE-IPHONE-15"`
	Category    string   `json:"category" xml:"category" example:"Смартфоны"`
	Revenue     float64  `json:"revenue" xml:"revenue" example:"5399946.00"`
	Quantity    int      `json:"quantity" xml:"quantity" example:"54"`
	ABCXYZGroup string   `json:"abc_xyz" xml:"abc_xyz_group" example:"AX"`
}

type XMLAssortment struct {
	XMLName  xml.Name              `xml:"assortment"`
	Products []AssortmentExportRow `xml:"products>product"`
}
