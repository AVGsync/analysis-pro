-- ============================================================
-- SEED: ~20 категорий, ~250 товаров, ~3000 продаж
-- Период продаж: 2025-01-01 — сегодня
-- ============================================================

-- Очистка (порядок важен из-за FK)
TRUNCATE sales, products, categories RESTART IDENTITY CASCADE;

-- ============================================================
-- КАТЕГОРИИ (20 штук)
-- ============================================================
INSERT INTO categories (name) VALUES
    ('Ноутбуки'),           -- 1
    ('Смартфоны'),          -- 2
    ('Планшеты'),           -- 3
    ('Умные часы'),         -- 4
    ('Наушники'),           -- 5
    ('Аксессуары'),         -- 6
    ('Телевизоры'),         -- 7
    ('Мониторы'),           -- 8
    ('Игровые консоли'),    -- 9
    ('Игровые аксессуары'), -- 10
    ('Бытовая техника'),    -- 11
    ('Кофемашины'),         -- 12
    ('Пылесосы'),           -- 13
    ('Фотоаппараты'),       -- 14
    ('Объективы'),          -- 15
    ('Принтеры'),           -- 16
    ('Сетевое оборудование'),-- 17
    ('Накопители'),         -- 18
    ('Блоки питания'),      -- 19
    ('Комплектующие');      -- 20

-- ============================================================
-- ТОВАРЫ (~250 штук)
-- ============================================================
INSERT INTO products (category_id, name, sku, price, stock) VALUES
-- Ноутбуки (1)
(1, 'Apple MacBook Air M3 13"',      'APPLE-MBA-M3-13',  129999, 12),
(1, 'Apple MacBook Air M3 15"',      'APPLE-MBA-M3-15',  149999, 8),
(1, 'Apple MacBook Pro M3 14"',      'APPLE-MBP-M3-14',  199999, 6),
(1, 'Apple MacBook Pro M3 16"',      'APPLE-MBP-M3-16',  249999, 4),
(1, 'Dell XPS 13 Plus',              'DELL-XPS-13P',      99999, 15),
(1, 'Dell XPS 15',                   'DELL-XPS-15',      129999, 10),
(1, 'Dell Inspiron 15',              'DELL-INS-15',       54999, 20),
(1, 'Lenovo ThinkPad X1 Carbon',     'LEN-TP-X1C',       119999, 9),
(1, 'Lenovo ThinkPad T14',           'LEN-TP-T14',        74999, 14),
(1, 'Lenovo IdeaPad 5 Pro',          'LEN-IP-5P',         64999, 18),
(1, 'Lenovo Legion 5 Pro',           'LEN-LEG-5P',        89999, 11),
(1, 'Asus ZenBook 14 OLED',          'ASUS-ZB-14O',       79999, 13),
(1, 'Asus ROG Zephyrus G14',         'ASUS-ROG-G14',     109999, 7),
(1, 'Asus VivoBook 15',              'ASUS-VB-15',        44999, 25),
(1, 'HP Spectre x360 14',            'HP-SPX-14',         99999, 8),
(1, 'HP Pavilion 15',                'HP-PAV-15',         49999, 22),
(1, 'Acer Swift 3',                  'ACER-SW3',          54999, 16),
(1, 'Acer Predator Helios 300',      'ACER-PH-300',       94999, 9),
(1, 'MSI Stealth 15',                'MSI-STL-15',        99999, 7),
(1, 'Huawei MateBook D 16',          'HW-MBD-16',         59999, 14),

-- Смартфоны (2)
(2, 'Apple iPhone 16 128GB',         'APPLE-IP16-128',    99999, 30),
(2, 'Apple iPhone 16 256GB',         'APPLE-IP16-256',   109999, 25),
(2, 'Apple iPhone 16 Pro 256GB',     'APPLE-IP16P-256',  129999, 20),
(2, 'Apple iPhone 16 Pro Max 256GB', 'APPLE-IP16PM-256', 149999, 15),
(2, 'Apple iPhone 15 128GB',         'APPLE-IP15-128',    79999, 18),
(2, 'Samsung Galaxy S25',            'SAM-S25',           89999, 28),
(2, 'Samsung Galaxy S25+',           'SAM-S25P',         109999, 20),
(2, 'Samsung Galaxy S25 Ultra',      'SAM-S25U',         139999, 12),
(2, 'Samsung Galaxy A55',            'SAM-A55',           39999, 35),
(2, 'Samsung Galaxy A35',            'SAM-A35',           29999, 40),
(2, 'Google Pixel 9',                'GOOG-PX9',          79999, 14),
(2, 'Google Pixel 9 Pro',            'GOOG-PX9P',        109999, 10),
(2, 'Xiaomi 14 Pro',                 'XMI-14P',           79999, 16),
(2, 'Xiaomi Redmi Note 13 Pro',      'XMI-RN13P',         29999, 45),
(2, 'OnePlus 12',                    'OP-12',             74999, 12),
(2, 'Nothing Phone (2a)',            'NTH-2A',            34999, 20),
(2, 'Realme GT 6',                   'RLME-GT6',          44999, 18),
(2, 'Vivo X100 Pro',                 'VIVO-X100P',        79999, 8),

-- Планшеты (3)
(3, 'Apple iPad Air M2 11"',         'APPLE-IPA-M2-11',   79999, 15),
(3, 'Apple iPad Air M2 13"',         'APPLE-IPA-M2-13',   99999, 10),
(3, 'Apple iPad Pro M4 11"',         'APPLE-IPP-M4-11',  119999, 8),
(3, 'Apple iPad Pro M4 13"',         'APPLE-IPP-M4-13',  149999, 5),
(3, 'Apple iPad 10th Gen',           'APPLE-IP-10',       49999, 20),
(3, 'Apple iPad mini 7',             'APPLE-IPM-7',       59999, 12),
(3, 'Samsung Galaxy Tab S10+',       'SAM-GTS10P',        89999, 9),
(3, 'Samsung Galaxy Tab S10 FE',     'SAM-GTS10FE',       49999, 14),
(3, 'Xiaomi Pad 7',                  'XMI-PAD7',          39999, 18),
(3, 'Lenovo Tab P12 Pro',            'LEN-TP12P',         54999, 11),

-- Умные часы (4)
(4, 'Apple Watch Series 10 42mm',    'APPLE-AWS10-42',    44999, 20),
(4, 'Apple Watch Series 10 46mm',    'APPLE-AWS10-46',    49999, 18),
(4, 'Apple Watch Ultra 2',           'APPLE-AWU2',        89999, 8),
(4, 'Samsung Galaxy Watch 7',        'SAM-GW7',           29999, 22),
(4, 'Samsung Galaxy Watch Ultra',    'SAM-GWU',           59999, 10),
(4, 'Garmin Fenix 8',                'GAR-F8',            74999, 7),
(4, 'Garmin Venu 3',                 'GAR-V3',            34999, 12),
(4, 'Xiaomi Watch S4',               'XMI-WS4',           14999, 25),
(4, 'Huawei Watch GT 5',             'HW-WGT5',           19999, 20),
(4, 'Polar Vantage V3',              'POL-VV3',           54999, 6),

-- Наушники (5)
(5, 'Apple AirPods Pro 2',           'APPLE-APP2',        24999, 50),
(5, 'Apple AirPods 4',               'APPLE-AP4',         19999, 40),
(5, 'Apple AirPods Max USB-C',       'APPLE-APM',         59999, 15),
(5, 'Sony WH-1000XM6',               'SONY-WH1000XM6',    34999, 25),
(5, 'Sony WF-1000XM6',               'SONY-WF1000XM6',    24999, 30),
(5, 'Bose QuietComfort 45',          'BOSE-QC45',         29999, 18),
(5, 'Bose QuietComfort Ultra',       'BOSE-QCU',          39999, 12),
(5, 'Sennheiser Momentum 4',         'SEN-M4',            29999, 15),
(5, 'Samsung Galaxy Buds3 Pro',      'SAM-GB3P',          17999, 28),
(5, 'JBL Tour Pro 3',                'JBL-TP3',           14999, 35),
(5, 'Jabra Evolve2 85',              'JAB-E285',          34999, 10),
(5, 'Bang & Olufsen Beoplay H100',   'BO-H100',           89999, 5),

-- Аксессуары (6)
(6, 'Apple MagSafe Charger 25W',     'APPLE-MGSF-25',      4999, 100),
(6, 'Apple USB-C Cable 2m',          'APPLE-USBC-2M',      2999, 80),
(6, 'Anker 140W GaN Charger',        'ANK-GAN140',         5999, 60),
(6, 'Belkin MagSafe 3-in-1',         'BLK-MGS3',          14999, 30),
(6, 'Spigen Ultra Hybrid Case',      'SPG-UH',             2499, 150),
(6, 'Apple Pencil Pro',              'APPLE-PCP',          14999, 25),
(6, 'Logitech MX Keys S',            'LOG-MXS',            9999, 35),
(6, 'Logitech MX Master 3S',         'LOG-MXM3S',          8999, 40),
(6, 'Apple Magic Keyboard',          'APPLE-MKB',          12999, 20),
(6, 'Apple Magic Mouse',             'APPLE-MM',            8999, 25),

-- Телевизоры (7)
(7, 'Samsung QLED 55" Q80D',         'SAM-QLED55-Q80D',   79999, 8),
(7, 'Samsung OLED 65" S95D',         'SAM-OLED65-S95D',  149999, 4),
(7, 'LG OLED 55" C4',                'LG-OLED55-C4',      89999, 7),
(7, 'LG OLED 65" G4',                'LG-OLED65-G4',     149999, 4),
(7, 'Sony Bravia XR 55" A95L',       'SNY-BR55-A95L',    109999, 5),
(7, 'Philips Ambilight 65"',         'PHIL-AMB65',        69999, 6),
(7, 'TCL QLED 55" C845',             'TCL-QLED55-C845',   44999, 12),
(7, 'Hisense ULED 65" U8N',          'HIS-ULED65-U8N',    64999, 8),

-- Мониторы (8)
(8, 'Apple Studio Display',          'APPLE-STD',         169999, 5),
(8, 'LG UltraFine 27" 5K',           'LG-UF27-5K',        89999, 7),
(8, 'Samsung Odyssey G9 49"',        'SAM-ODG9-49',        99999, 4),
(8, 'Dell U2724D 27" 4K',            'DELL-U2724D',        44999, 10),
(8, 'Asus ProArt PA329CV',           'ASUS-PA329CV',       54999, 8),
(8, 'LG 27" UHD 4K Nano IPS',        'LG-27UHD-NANO',      34999, 14),
(8, 'BenQ PD3225U',                  'BENQ-PD3225U',       64999, 6),
(8, 'Acer Predator X34',             'ACER-PX34',          49999, 9),

-- Игровые консоли (9)
(9, 'Sony PlayStation 5',            'SNY-PS5',            54999, 15),
(9, 'Sony PlayStation 5 Slim',       'SNY-PS5S',           44999, 20),
(9, 'Microsoft Xbox Series X',       'MS-XSX',             49999, 12),
(9, 'Microsoft Xbox Series S',       'MS-XSS',             29999, 18),
(9, 'Nintendo Switch OLED',          'NIN-SWOLED',         34999, 22),
(9, 'Nintendo Switch 2',             'NIN-SW2',            44999, 16),
(9, 'Steam Deck OLED 512GB',         'VALVE-SDOLED',       54999, 10),

-- Игровые аксессуары (10)
(10, 'Sony DualSense Edge',          'SNY-DSE',            14999, 20),
(10, 'Xbox Wireless Controller',     'MS-XWCON',            6999, 30),
(10, 'Nintendo Pro Controller',      'NIN-PCON',            7999, 25),
(10, 'Razer DeathAdder V3',          'RAZ-DAV3',            8999, 20),
(10, 'SteelSeries Apex Pro',         'STL-AP',             14999, 12),
(10, 'Logitech G Pro X Superlight',  'LOG-GPX2',           12999, 15),
(10, 'HyperX Cloud Alpha',           'HPX-CA',              9999, 18),
(10, 'Astro A50 X',                  'AST-A50X',           24999, 8),

-- Бытовая техника (11)
(11, 'Dyson V15 Detect',             'DYS-V15D',           59999, 10),
(11, 'Dyson V12 Detect Slim',        'DYS-V12DS',          44999, 12),
(11, 'Xiaomi Robot Vacuum S20+',     'XMI-RVS20P',         29999, 15),
(11, 'iRobot Roomba j9+',            'IRB-J9P',            54999, 8),
(11, 'Philips Airfryer XXL',         'PHIL-AFXXL',         14999, 20),
(11, 'Tefal Easy Fry Grill',         'TEF-EFGX',            9999, 25),
(11, 'Instant Pot Duo 7-in-1',       'INS-DUO7',            8999, 18),

-- Кофемашины (12)
(12, 'DeLonghi Dinamica Plus',       'DEL-DIN-P',          69999, 6),
(12, 'DeLonghi Magnifica Evo',       'DEL-MAG-EVO',        44999, 8),
(12, 'Jura E8',                      'JUR-E8',             89999, 4),
(12, 'Philips 4400 Series',          'PHIL-4400',          39999, 9),
(12, 'Breville Barista Express',     'BRV-BE',             44999, 7),
(12, 'Nespresso Vertuo Next',        'NES-VN',             14999, 15),
(12, 'Siemens EQ.900',               'SIE-EQ900',          74999, 5),

-- Пылесосы (13)
(13, 'Dyson Ball Animal 3',          'DYS-BA3',            34999, 8),
(13, 'Miele Complete C3',            'MIE-CC3',            44999, 6),
(13, 'Samsung Jet 95',               'SAM-J95',            29999, 10),
(13, 'LG CordZero A9',               'LG-CZA9',            39999, 7),
(13, 'Bosch Series 8',               'BSH-S8',             24999, 12),

-- Фотоаппараты (14)
(14, 'Sony Alpha 7 IV',              'SNY-A7IV',           199999, 5),
(14, 'Sony Alpha 7C II',             'SNY-A7CII',          149999, 6),
(14, 'Canon EOS R8',                 'CAN-R8',             89999, 7),
(14, 'Canon EOS R50',                'CAN-R50',            54999, 10),
(14, 'Nikon Z30',                    'NIK-Z30',            44999, 8),
(14, 'Nikon Z6 III',                 'NIK-Z6III',         179999, 4),
(14, 'Fujifilm X-T5',                'FUJ-XT5',           149999, 5),
(14, 'Fujifilm X100VI',              'FUJ-X100VI',        109999, 7),

-- Объективы (15)
(15, 'Sony FE 24-70mm f/2.8 GM II', 'SNY-2470GM2',       179999, 4),
(15, 'Sony FE 85mm f/1.4 GM',       'SNY-85GM',           99999, 5),
(15, 'Canon RF 50mm f/1.2L',        'CAN-RF50',          149999, 3),
(15, 'Tamron 28-75mm f/2.8',        'TAM-2875',           54999, 8),
(15, 'Sigma 35mm f/1.4 DG DN Art',  'SIG-35A',            59999, 6),
(15, 'Viltrox 85mm f/1.8 AF',       'VTX-85',             19999, 10),

-- Принтеры (16)
(16, 'HP LaserJet Pro M404dn',       'HP-LJP-M404',       24999, 10),
(16, 'Canon PIXMA G7020',            'CAN-PG7020',        14999, 14),
(16, 'Epson EcoTank ET-4850',        'EPS-ET4850',        19999, 12),
(16, 'Brother HL-L2370DW',           'BRO-L2370',         12999, 16),
(16, 'HP OfficeJet Pro 9025e',       'HP-OJP-9025',       18999, 10),

-- Сетевое оборудование (17)
(17, 'Apple AirPort Express',        'APPLE-APE',           9999, 20),
(17, 'TP-Link Deco XE75 Pro',        'TPL-XE75P',          24999, 15),
(17, 'ASUS ZenWifi Pro ET12',        'ASUS-ZWE12',         34999, 8),
(17, 'Netgear Orbi RBK863S',         'NGR-RBK863',         44999, 6),
(17, 'Ubiquiti UniFi Dream Machine', 'UBI-UDM',            29999, 7),
(17, 'MikroTik hAP ax3',             'MTK-HAX3',            7999, 20),

-- Накопители (18)
(18, 'Samsung 990 Pro 2TB NVMe',     'SAM-990P-2T',        14999, 30),
(18, 'WD Black SN850X 1TB',          'WD-SN850X-1T',        8999, 35),
(18, 'Seagate Barracuda 4TB HDD',    'SEA-BB-4T',           5999, 25),
(18, 'Samsung T7 Shield 2TB',        'SAM-T7S-2T',          9999, 28),
(18, 'Kingston XS2000 1TB',          'KNG-XS2K-1T',         6999, 30),
(18, 'Crucial P3 Plus 4TB',          'CRU-P3P-4T',         12999, 20),

-- Блоки питания (19)
(19, 'Corsair RM1000x 80+ Gold',     'COR-RM1000X',        14999, 12),
(19, 'Seasonic Focus GX-850',        'SEA-FGX850',         12999, 14),
(19, 'be quiet! Straight Power 12',  'BEQ-SP12-850',       13999, 10),
(19, 'EVGA SuperNOVA 750 G7',        'EVGA-SN750G7',       11999, 12),

-- Комплектующие (20)
(20, 'AMD Ryzen 9 7950X',            'AMD-R9-7950X',       49999, 8),
(20, 'Intel Core i9-14900K',         'INT-I9-14900K',      44999, 7),
(20, 'NVIDIA RTX 4090 24GB',         'NV-RTX4090',        159999, 4),
(20, 'NVIDIA RTX 4080 Super',        'NV-RTX4080S',        89999, 6),
(20, 'AMD RX 7900 XTX',              'AMD-RX7900XTX',      69999, 5),
(20, 'Corsair Vengeance 64GB DDR5',  'COR-V-64-D5',        14999, 15),
(20, 'ASUS ROG Maximus Z790',        'ASUS-ROG-Z790',      44999, 6),
(20, 'Noctua NH-D15 chromax',        'NOC-NHD15C',          5999, 20);

-- ============================================================
-- ПРОДАЖИ — генерируем через generate_series
-- ~3000 записей с 2025-01-01 по сегодня
-- ============================================================
INSERT INTO sales (product_id, quantity, revenue, sold_at)
WITH

-- Список товаров с весами популярности и ценами
product_weights AS (
    SELECT
        p.id,
        p.price,
        -- популярность: AirPods, iPhone, Samsung — чаще продаются
        CASE
            WHEN p.category_id IN (2, 5, 6) THEN 8   -- смартфоны, наушники, аксессуары
            WHEN p.category_id IN (1, 3, 4) THEN 5   -- ноутбуки, планшеты, часы
            WHEN p.category_id IN (7, 9, 18)THEN 4   -- ТВ, консоли, накопители
            WHEN p.category_id IN (11,12,13)THEN 3   -- бытовая техника
            WHEN p.category_id IN (20, 19)  THEN 3   -- комплектующие
            ELSE 2                                    -- редкие товары
        END AS weight
    FROM products p
),

-- Случайные даты с 2025-01-01 до сегодня
date_series AS (
    SELECT
        generate_series(
            '2025-01-01'::date,
            CURRENT_DATE,
            '1 day'::interval
        )::date AS sale_date
),

-- ~10 продаж в день (некоторые дни пустые)
daily_sales AS (
    SELECT
        sale_date,
        -- берём product_id через mod от случайного числа по массиву ID
        (
            ARRAY(SELECT id FROM products ORDER BY id)
        )[ 1 + (floor(random() * (SELECT COUNT(*) FROM products)))::int ] AS product_id,
        (floor(random() * 5) + 1)::int AS quantity
    FROM date_series
    CROSS JOIN generate_series(1, 8)
    WHERE random() > 0.2
),

-- Добавляем сезонность: декабрь/январь +50%, летом -20%
seasonal_sales AS (
    SELECT
        ds.sale_date,
        ds.product_id,
        -- сезонный множитель количества
        CASE
            WHEN EXTRACT(MONTH FROM ds.sale_date) IN (11, 12) THEN
                GREATEST(1, round(ds.quantity * 1.5))::int  -- ноябрь-декабрь +50%
            WHEN EXTRACT(MONTH FROM ds.sale_date) IN (6, 7, 8) THEN
                GREATEST(1, round(ds.quantity * 0.8))::int  -- лето -20%
            ELSE ds.quantity
        END AS quantity,
        pw.price
    FROM daily_sales ds
    JOIN product_weights pw ON pw.id = ds.product_id
)

SELECT
    product_id,
    quantity,
    (quantity * price)::numeric(12,2) AS revenue,
    sale_date AS sold_at
FROM seasonal_sales
ORDER BY sale_date, product_id;