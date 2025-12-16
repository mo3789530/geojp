CREATE TABLE address_master (
  id BIGSERIAL PRIMARY KEY,

  -- 住所要素
  prefecture TEXT NOT NULL,          -- 都道府県名
  city TEXT NOT NULL,                -- 市区町村名
  town TEXT,                          -- 大字_丁目名
  sub_town TEXT,                      -- 小字_通称名
  block TEXT,                         -- 街区符号_地番

  -- 座標
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  geom GEOMETRY(Point, 4326),

  -- 元データ属性
  coordinate_system INTEGER,          -- 座標系番号
  x_coordinate DOUBLE PRECISION,      -- X座標
  y_coordinate DOUBLE PRECISION,      -- Y座標

  residential_flag BOOLEAN,           -- 住居表示フラグ
  representative_flag BOOLEAN,        -- 代表フラグ
  before_update_flag BOOLEAN,         -- 更新前履歴フラグ
  after_update_flag BOOLEAN,          -- 更新後履歴フラグ


  created_at TIMESTAMP DEFAULT now()
);

UPDATE address_master
SET geom = ST_SetSRID(ST_MakePoint(lon, lat), 4326)
WHERE lat IS NOT NULL
  AND lon IS NOT NULL;


CREATE INDEX idx_address_master_geom
ON address_master
USING GIST (geom);


CREATE INDEX idx_address_master_representative_geom
ON address_master
USING GIST (geom)
WHERE representative_flag = true;

CREATE INDEX idx_address_master_pref_city
ON address_master (prefecture, city);

SELECT
  prefecture,
  city,
  town,
  sub_town,
  block
FROM address_master
WHERE representative_flag = true
  AND geom IS NOT NULL
ORDER BY
  geom <-> ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)
LIMIT 1;


CREATE TABLE geocode_cache (
  geohash TEXT PRIMARY KEY,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,

  prefecture TEXT,
  city TEXT,
  town TEXT,
  sub_town TEXT,
  block TEXT,

  source TEXT DEFAULT 'address_master',
  precision TEXT,                     -- block / town / city
  created_at TIMESTAMP DEFAULT now()
);


CREATE INDEX idx_geocode_cache_created_at
ON geocode_cache (created_at);


CREATE TABLE address_raw (
  prefecture TEXT,
  city TEXT,
  town TEXT,
  sub_town TEXT,
  block TEXT,
  coord_sys INTEGER,
  x_coord DOUBLE PRECISION,
  y_coord DOUBLE PRECISION,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  residence_flag INTEGER,
  representative_flag INTEGER,
  before_update_flag INTEGER,
  after_update_flag INTEGER
);


COPY address_raw (
  prefecture,
  city,
  town,
  sub_town,
  block,
  coord_sys,
  x_coord,
  y_coord,
  lat,
  lon,
  residence_flag,
  representative_flag,
  before_update_flag,
  after_update_flag
)
FROM '/csv_data/tokyo.csv'
WITH (
  FORMAT csv,
  HEADER true,
  QUOTE '"'
);
