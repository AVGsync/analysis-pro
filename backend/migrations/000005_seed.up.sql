-- Категории
INSERT INTO categories (name) VALUES
    ('Ноутбуки'),
    ('Смартфоны'),
    ('Бытовая техника'),
    ('Аксессуары'),
    ('Планшеты');

-- Товары
INSERT INTO products (category_id, name, sku, price, stock) VALUES
    (1, 'Ноутбук Dell XPS 13',        'DELL-XPS-13',   89999.00, 15),
    (1, 'Ноутбук MacBook Air M2',      'APPLE-MBA-M2',  129999.00, 8),
    (1, 'Ноутбук Lenovo ThinkPad X1',  'LEN-TP-X1',     95000.00, 12),
    (2, 'Смартфон iPhone 15',          'APPLE-IP-15',   99999.00, 25),
    (2, 'Смартфон Samsung Galaxy S24', 'SAM-S24',       79999.00, 30),
    (2, 'Смартфон Google Pixel 8',     'GOOG-PX-8',     69999.00, 10),
    (3, 'Кофемашина DeLonghi',         'DEL-CM-01',     45000.00, 7),
    (3, 'Пылесос Dyson V15',           'DYS-V15',       59999.00, 5),
    (4, 'AirPods Pro 2',               'APPLE-APP-2',   24999.00, 50),
    (5, 'iPad Air M1',                 'APPLE-IPAD-A',  69999.00, 20);

-- Продажи за последние 30 дней
INSERT INTO sales (product_id, quantity, revenue, sold_at) VALUES
    -- Dell XPS 13
    (1, 2, 179998.00, CURRENT_DATE - 1),
    (1, 1, 89999.00,  CURRENT_DATE - 5),
    (1, 3, 269997.00, CURRENT_DATE - 12),
    (1, 2, 179998.00, CURRENT_DATE - 20),

    -- MacBook Air
    (2, 1, 129999.00, CURRENT_DATE - 2),
    (2, 2, 259998.00, CURRENT_DATE - 8),
    (2, 1, 129999.00, CURRENT_DATE - 15),

    -- iPhone 15
    (4, 3, 299997.00, CURRENT_DATE - 1),
    (4, 2, 199998.00, CURRENT_DATE - 6),
    (4, 5, 499995.00, CURRENT_DATE - 10),
    (4, 1, 99999.00,  CURRENT_DATE - 18),
    (4, 4, 399996.00, CURRENT_DATE - 25),

    -- Samsung S24
    (5, 2, 159998.00, CURRENT_DATE - 3),
    (5, 3, 239997.00, CURRENT_DATE - 9),
    (5, 1, 79999.00,  CURRENT_DATE - 14),

    -- Кофемашина
    (7, 1, 45000.00,  CURRENT_DATE - 4),
    (7, 2, 90000.00,  CURRENT_DATE - 11),
    (7, 1, 45000.00,  CURRENT_DATE - 22),

    -- AirPods
    (9, 5, 124995.00, CURRENT_DATE - 2),
    (9, 3, 74997.00,  CURRENT_DATE - 7),
    (9, 4, 99996.00,  CURRENT_DATE - 16),

    -- Dyson
    (8, 1, 59999.00,  CURRENT_DATE - 5),
    (8, 2, 119998.00, CURRENT_DATE - 19),

    -- iPad
    (10, 2, 139998.00, CURRENT_DATE - 3),
    (10, 1, 69999.00,  CURRENT_DATE - 13);