CREATE TABLE products (
    id          SERIAL       PRIMARY KEY,
    category_id INT          REFERENCES categories(id) ON DELETE SET NULL,
    name        VARCHAR(255) NOT NULL,
    sku         VARCHAR(64)  NOT NULL UNIQUE,       -- артикул
    price       NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    stock       INT           NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku         ON products(sku);