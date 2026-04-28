CREATE TABLE sales (
    id         SERIAL  PRIMARY KEY,
    product_id INT     NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity   INT           NOT NULL CHECK (quantity > 0),
    revenue    NUMERIC(12,2) NOT NULL CHECK (revenue >= 0),
    sold_at    DATE          NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX idx_sales_product_id   ON sales(product_id);
CREATE INDEX idx_sales_sold_at      ON sales(sold_at);
CREATE INDEX idx_sales_product_date ON sales(product_id, sold_at);
