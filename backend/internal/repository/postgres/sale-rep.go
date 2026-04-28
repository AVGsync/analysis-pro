package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/AVGsync/analysis-pro/backend/internal/model"
)

type SaleRepository struct {
	database *DB
}

func (r *SaleRepository) GetSaleDetails(ctx context.Context, from, to time.Time) ([]model.SaleDetail, error) {
	rows, err := r.database.db.QueryContext(ctx, `
		SELECT
			s.sold_at,
			p.name,
			c.name,
			s.quantity,
			s.revenue
		FROM sales s
		JOIN products   p ON p.id = s.product_id
		JOIN categories c ON c.id = p.category_id
		WHERE s.sold_at BETWEEN $1 AND $2
		ORDER BY s.sold_at DESC
	`, from, to)
	if err != nil {
		return nil, fmt.Errorf("sale repository: get sale details: %w", err)
	}
	defer rows.Close()

	var sales []model.SaleDetail
	for rows.Next() {
		var s model.SaleDetail
		if err := rows.Scan(
			&s.SoldAt,
			&s.ProductName,
			&s.Category,
			&s.Quantity,
			&s.Revenue,
		); err != nil {
			return nil, fmt.Errorf("sale repository: get sale details: scan: %w", err)
		}
		sales = append(sales, s)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("sale repository: get sale details: rows error: %w", err)
	}

	return sales, nil
}