package handler

import (
	"context"
	"encoding/csv"
	"encoding/xml"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/AVGsync/analysis-pro/backend/internal/model"
)

type ExportUseCase interface {
	GetForecastExport(ctx context.Context, days, history int) ([]model.ForecastExportRow, error)
	GetAssortmentExport(ctx context.Context) ([]model.AssortmentExportRow, error)
}

type ExportHandler struct {
	useCase ExportUseCase
}

func NewExportHandler(useCase ExportUseCase) *ExportHandler {
	return &ExportHandler{useCase: useCase}
}

// ExportForecast godoc
//
// @Summary Экспортировать рекомендации прогноза
// @Description Скачивает отчёт по рекомендациям прогноза в формате CSV или XML.
// @Description Колонки CSV: `Товар`, `SKU`, `Прогноз продаж`, `Рекомендуемый запас`, `Текущий остаток`, `Статус`.
// @Description Поля элемента XML: `name`, `sku`, `forecast_total`, `recommend_order`, `current_stock`, `urgency`.
// @Description Требует валидную cookie `token`. Формат имени файла: `forecast_YYYY-MM-DD.csv` или `forecast_YYYY-MM-DD.xml`.
// @Tags Экспорт
// @Produce text/csv,application/xml
// @Security CookieAuth
// @Param days query int false "Горизонт прогноза в днях. По умолчанию: 30." default(30) minimum(1) maximum(365)
// @Param history query int false "Период истории продаж в днях. По умолчанию: 90." default(90) minimum(1) maximum(730)
// @Param type query string false "Формат экспорта. Пустое значение или `csv` возвращает CSV; `xml` возвращает XML." Enums(csv,xml) default(csv)
// @Success 200 {file} file "Файл экспорта прогноза"
// @Header 200 {string} Content-Disposition "attachment; filename=\"forecast_2026-04-29.csv\""
// @Failure 401 {string} string "Пользователь не авторизован"
// @Failure 500 {string} string "Claims не найдены в контексте"
// @Failure 500 {string} string "Не удалось получить данные прогноза"
// @Router /products/export/forecast [get]
func (h *ExportHandler) ExportForecast() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, ok := r.Context().Value("claims").(*model.Claims)
		if !ok {
			http.Error(w, "claims not found in context", http.StatusInternalServerError)
			return
		}

		days, err := strconv.Atoi(r.URL.Query().Get("days"))
		if err != nil {
			days = 30
		}

		history, err := strconv.Atoi(r.URL.Query().Get("history"))
		if err != nil {
			history = 90
		}

		rows, err := h.useCase.GetForecastExport(r.Context(), days, history)
		if err != nil {
			http.Error(w, "failed to get forecast data", http.StatusInternalServerError)
			return
		}

		filename := fmt.Sprintf("forecast_%s", time.Now().Format("2006-01-02"))
		switch r.URL.Query().Get("type") {
		case "xml":
			writeXML(w, filename, rows)
		default:
			writeForecastCSV(w, filename, rows)
		}
	}
}

// ExportAssortment godoc
//
// @Summary Экспортировать аналитику ассортимента
// @Description Скачивает отчёт по аналитике ассортимента в формате CSV или XML.
// @Description Колонки CSV: `Товар`, `SKU`, `Категория`, `Выручка`, `Объём продаж`, `Группа ABC/XYZ`.
// @Description Поля элемента XML: `name`, `sku`, `category`, `revenue`, `quantity`, `abc_xyz_group`.
// @Description Требует валидную cookie `token`. Формат имени файла: `assortment_YYYY-MM-DD.csv` или `assortment_YYYY-MM-DD.xml`.
// @Tags Экспорт
// @Produce text/csv,application/xml
// @Security CookieAuth
// @Param type query string false "Формат экспорта. Пустое значение или `csv` возвращает CSV; `xml` возвращает XML." Enums(csv,xml) default(csv)
// @Success 200 {file} file "Файл экспорта ассортимента"
// @Header 200 {string} Content-Disposition "attachment; filename=\"assortment_2026-04-29.csv\""
// @Failure 401 {string} string "Пользователь не авторизован"
// @Failure 500 {string} string "Не удалось получить данные ассортимента"
// @Router /products/export/assortment [get]
func (h *ExportHandler) ExportAssortment() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := h.useCase.GetAssortmentExport(r.Context())
		if err != nil {
			http.Error(w, "failed to get assortment data", http.StatusInternalServerError)
			return
		}

		filename := fmt.Sprintf("assortment_%s", time.Now().Format("2006-01-02"))

		switch r.URL.Query().Get("type") {
		case "xml":
			writeXML(w, filename, rows)
		default:
			writeAssortmentCSV(w, filename, rows)
		}
	}
}

func writeForecastCSV(w http.ResponseWriter, filename string, rows []model.ForecastExportRow) {
	setDownloadHeaders(w, filename+".csv", "text/csv")

	wr := csv.NewWriter(w)
	wr.Write([]string{"Товар", "SKU", "Прогноз продаж", "Рекомендуемый запас", "Текущий остаток", "Статус"})

	for _, r := range rows {
		wr.Write([]string{
			r.ProductName,
			r.SKU,
			fmt.Sprintf("%d", r.ForecastTotal),
			fmt.Sprintf("%d", r.RecommendOrder),
			fmt.Sprintf("%d", r.CurrentStock),
			r.Urgency,
		})
	}
	wr.Flush()
}

func writeAssortmentCSV(w http.ResponseWriter, filename string, rows []model.AssortmentExportRow) {
	setDownloadHeaders(w, filename+".csv", "text/csv")

	wr := csv.NewWriter(w)
	wr.Write([]string{"Товар", "SKU", "Категория", "Выручка", "Объём продаж", "Группа ABC/XYZ"})

	for _, r := range rows {
		wr.Write([]string{
			r.ProductName,
			r.SKU,
			r.Category,
			fmt.Sprintf("%.2f", r.Revenue),
			fmt.Sprintf("%d", r.Quantity),
			r.ABCXYZGroup,
		})
	}
	wr.Flush()
}

func writeXML(w http.ResponseWriter, filename string, data any) {
	setDownloadHeaders(w, filename+".xml", "application/xml")

	w.Write([]byte(xml.Header))
	enc := xml.NewEncoder(w)
	enc.Indent("", "  ")
	enc.Encode(data)
}

func setDownloadHeaders(w http.ResponseWriter, filename, contentType string) {
	w.Header().Set("Content-Type", contentType+"; charset=utf-8")
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
}
