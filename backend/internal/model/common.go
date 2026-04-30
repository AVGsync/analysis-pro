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
	SoldAt   time.Time `json:"sold_at" db:"sold_at"`
	Quantity int       `json:"quantity" db:"quantity"`
}

type ProductInput struct {
	ProductID    int          `json:"product_id" db:"product_id"`
	ProductName  string       `json:"product_name" db:"product_name"`
	SKU          string       `json:"sku" db:"sku"`
	CurrentStock int          `json:"current_stock" db:"current_stock"`
	Price        float64      `json:"price" db:"price"`
	Sales        []SaleRecord `json:"sales"`
}

type ForecastRequest struct {
	Products     []ProductInput `json:"products"`
	ForecastDays int            `json:"forecast_days"`
	HistoryDays  int            `json:"history_days"`
}

type DailyPoint struct {
	Date     string `json:"date"`
	Quantity int   `json:"quantity"`
}

type ForecastDetail struct {
	ProductID      int          `json:"product_id"`
	ProductName    string       `json:"product_name"`
	SKU            string       `json:"sku"`
	ForecastTotal int          `json:"forecast_total"`
	DailyAvg       float64      `json:"daily_avg"`
	DailyBreakdown []DailyPoint `json:"daily_breakdown"`
	Method         string       `json:"method"`
}

type RecommendationItem struct {
	ProductID      int    `json:"product_id"`
	ProductName    string `json:"product_name"`
	SKU            string `json:"sku"`
	CurrentStock   int    `json:"current_stock"`
	ForecastTotal  int    `json:"forecast_total"`
	RecommendOrder int    `json:"recommend_order"`
	StockDaysLeft  int    `json:"stock_days_left"`
	Urgency         string `json:"urgency"`
}

type MonthlyPoint struct {
	Month           string  `json:"month"`
	ForecastQty     int     `json:"forecast_qty"`
	ForecastRevenue float64 `json:"forecast_revenue"`
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
