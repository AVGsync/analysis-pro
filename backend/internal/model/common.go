package model

import (
	"encoding/xml"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type User struct {
	ID			 						string `json:"id"`
	FullName 						string `json:"full_name"`
	Email    						string `json:"email"`
	PasswordHash 				string `json:"password_hash"`
	Role     						string `json:"role"`
	SubscriptionPlan    string `json:"subscription_plan"`
	SubscriptionExpires *time.Time `json:"subscription_expires"`
}

type Claims struct {
    UserID string `json:"user_id"`
    Role   string `json:"role"`
		SubscriptionPlan string `json:"subscription_plan"`

    jwt.RegisteredClaims
}

type SaleDetail struct {
	SoldAt      time.Time `json:"sold_at"`
	ProductName string    `json:"product_name"`
	Category    string    `json:"category"`
	Quantity    int       `json:"quantity"`
	Revenue     float64   `json:"revenue"`
}

// ------------------ Forecast Models ------------------

type SaleRecord struct {
	SoldAt   string `json:"sold_at"` 
	Quantity int    `json:"quantity"`
}

type ProductInput struct {
	ProductID    int          `json:"product_id"`
	ProductName  string       `json:"product_name"`
	SKU          string       `json:"sku"`
	CurrentStock int          `json:"current_stock"`
	Price        float64      `json:"price"`
	Sales        []SaleRecord `json:"sales"`
}

// ответ /forecast — детализированный прогноз по товару
type DailyPoint struct {
	Date     string `json:"date"`
	Quantity int    `json:"quantity"`
}

type ForecastDetail struct {
	ProductID      int          `json:"product_id"`
	ProductName    string       `json:"product_name"`
	SKU            string       `json:"sku"`
	ForecastTotal  int          `json:"forecast_total"`
	DailyAvg       float64      `json:"daily_avg"`
	DailyBreakdown []DailyPoint `json:"daily_breakdown"`
	Method         string       `json:"method"`
}

// ответ /recommendations — рекомендации по закупкам
type RecommendationItem struct {
	ProductID      int    `json:"product_id"`
	ProductName    string `json:"product_name"`
	SKU            string `json:"sku"`
	CurrentStock   int    `json:"current_stock"`
	ForecastTotal  int    `json:"forecast_total"`
	RecommendOrder int    `json:"recommend_order"`
	StockDaysLeft  int    `json:"stock_days_left"`
	Urgency        string `json:"urgency"` // "high" | "medium" | "ok"
}

// ответ /forecast/monthly — месячный прогноз для графика
type MonthlyPoint struct {
	Month           string  `json:"month"`            // "2026-05-01"
	ForecastQty     int     `json:"forecast_qty"`     // штуки
	ForecastRevenue float64 `json:"forecast_revenue"` // выручка
}

// ----------------------- Export Models -----------------------

// ForecastExportRow — строка экспорта прогноза
type ForecastExportRow struct {
	XMLName        xml.Name `json:"-"        xml:"product"`
	ProductName    string   `json:"product_name"    xml:"name"`
	SKU            string   `json:"sku"             xml:"sku"`
	ForecastTotal  int      `json:"forecast_total"  xml:"forecast_total"`
	RecommendOrder int      `json:"recommend_order" xml:"recommend_order"`
	CurrentStock   int      `json:"current_stock"   xml:"current_stock"`
	Urgency        string   `json:"urgency"         xml:"urgency"`
}

// XMLForecast — обёртка для валидного XML документа
type XMLForecast struct {
	XMLName  xml.Name            `xml:"forecast"`
	Products []ForecastExportRow `xml:"products>product"`
}

// AssortmentExportRow — строка экспорта ассортимента
type AssortmentExportRow struct {
	XMLName     xml.Name `json:"-"           xml:"product"`
	ProductName string   `json:"product_name" xml:"name"`
	SKU         string   `json:"sku"          xml:"sku"`
	Category    string   `json:"category"     xml:"category"`
	Revenue     float64  `json:"revenue"      xml:"revenue"`
	Quantity    int      `json:"quantity"     xml:"quantity"`
	ABCXYZGroup string   `json:"abc_xyz"      xml:"abc_xyz_group"`
}

type XMLAssortment struct {
	XMLName  xml.Name              `xml:"assortment"`
	Products []AssortmentExportRow `xml:"products>product"`
}