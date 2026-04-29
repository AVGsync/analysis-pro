package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/AVGsync/analysis-pro/backend/internal/model"
)

type ForecastRepository struct {
	database *DB
}

func (r *ForecastRepository) GetProductsWithSales(ctx context.Context, historyDays int) ([]model.ProductInput, error) {
	rows, err := r.database.db.QueryContext(ctx, `
		SELECT
			p.id,
			p.name,
			p.sku,
			p.stock,
			p.price,
			s.sold_at,
			SUM(s.quantity) AS qty
		FROM products p
		LEFT JOIN sales s ON s.product_id = p.id
			AND s.sold_at >= CURRENT_DATE - ($1::int * INTERVAL '1 day')
		GROUP BY p.id, p.name, p.sku, p.stock, p.price, s.sold_at
		ORDER BY p.id, s.sold_at
	`, historyDays)
	if err != nil {
		return nil, fmt.Errorf("forecast repository: get products with sales: %w", err)
	}
	defer rows.Close()

	// группируем по product_id
	type productKey = int
	productMap := make(map[productKey]*model.ProductInput)
	var order []int // сохраняем порядок

	for rows.Next() {
		var (
			id, stock    int
			name, sku    string
			price        float64
			soldAt       *time.Time // nullable — LEFT JOIN может дать NULL
			qty          *int
		)

		if err := rows.Scan(&id, &name, &sku, &stock, &price, &soldAt, &qty); err != nil {
			return nil, fmt.Errorf("forecast repository: scan: %w", err)
		}

		// первая встреча с товаром — создаём запись
		if _, ok := productMap[id]; !ok {
			productMap[id] = &model.ProductInput{
				ProductID:    id,
				ProductName:  name,
				SKU:          sku,
				CurrentStock: stock,
				Price:        price,
				Sales:        []model.SaleRecord{},
			}
			order = append(order, id)
		}

		// добавляем продажу если она есть (LEFT JOIN может вернуть NULL)
		if soldAt != nil && qty != nil {
			productMap[id].Sales = append(productMap[id].Sales, model.SaleRecord{
				SoldAt:   soldAt.Format("2006-01-02"),
				Quantity: *qty,
			})
		}
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("forecast repository: rows error: %w", err)
	}

	// собираем в правильном порядке
	result := make([]model.ProductInput, len(order))
	for i, id := range order {
		result[i] = *productMap[id]
	}
	return result, nil
}
