package postgres

import (
	"context"
	"fmt"

	"github.com/AVGsync/analysis-pro/backend/internal/model"
)

type ExportRepository struct {
	database *DB
}

func (r *ExportRepository) GetAssortmentExportData(ctx context.Context) ([]model.AssortmentExportRow, error) {
	rows, err := r.database.db.QueryContext(ctx, `
		WITH product_stats AS (
			SELECT
				p.id,
				p.name,
				p.sku,
				c.name          AS category,
				SUM(s.revenue)  AS revenue,
				SUM(s.quantity) AS quantity,
				NTILE(3) OVER (ORDER BY SUM(s.revenue) DESC) AS abc_rank,
				STDDEV(s.quantity) / NULLIF(AVG(s.quantity), 0) AS cv
			FROM products p
			JOIN categories c ON c.id = p.category_id
			LEFT JOIN sales s ON s.product_id = p.id
				AND s.sold_at >= CURRENT_DATE - INTERVAL '90 days'
			GROUP BY p.id, p.name, p.sku, c.name
		)
		SELECT
			name,
			sku,
			category,
			COALESCE(revenue, 0),
			COALESCE(quantity, 0),
			CASE abc_rank WHEN 1 THEN 'A' WHEN 2 THEN 'B' ELSE 'C' END ||
			CASE
				WHEN cv IS NULL OR cv < 0.1 THEN 'X'
				WHEN cv < 0.25             THEN 'Y'
				ELSE                            'Z'
			END AS abc_xyz
		FROM product_stats
		ORDER BY revenue DESC NULLS LAST
	`)
	if err != nil {
		return nil, fmt.Errorf("export repository: get assortment: %w", err)
	}
	defer rows.Close()

	var result []model.AssortmentExportRow
	for rows.Next() {
		var row model.AssortmentExportRow
		if err := rows.Scan(
			&row.ProductName,
			&row.SKU,
			&row.Category,
			&row.Revenue,
			&row.Quantity,
			&row.ABCXYZGroup,
		); err != nil {
			return nil, fmt.Errorf("export repository: scan: %w", err)
		}
		result = append(result, row)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("export repository: rows error: %w", err)
	}

	return result, nil
}

func (r *ExportRepository) GetForecastExportData(ctx context.Context) ([]model.ForecastExportRow, error) {
	rows, err := r.database.db.QueryContext(ctx, `
		SELECT
			p.name,
			p.sku,
			p.stock,
			COALESCE(SUM(s.quantity), 0) AS forecast_total
		FROM products p
		LEFT JOIN sales s ON s.product_id = p.id
			AND s.sold_at >= CURRENT_DATE - INTERVAL '30 days'
		GROUP BY p.id, p.name, p.sku, p.stock
		ORDER BY forecast_total DESC
	`)
	if err != nil {
		return nil, fmt.Errorf("export repository: get forecast: %w", err)
	}
	defer rows.Close()

	var result []model.ForecastExportRow
	for rows.Next() {
		var row model.ForecastExportRow
		if err := rows.Scan(
			&row.ProductName,
			&row.SKU,
			&row.CurrentStock,
			&row.ForecastTotal,
		); err != nil {
			return nil, fmt.Errorf("export repository: scan forecast: %w", err)
		}
		result = append(result, row)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("export repository: rows error: %w", err)
	}

	return result, nil
}