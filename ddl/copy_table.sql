-- COPY master from raw
INSERT INTO address_master (
  prefecture,
  city,
  town,
  sub_town,
  block,
  lat,
  lon,
  representative_flag
)
SELECT
  prefecture,
  city,
  town,
  sub_town,
  block,
  lat,
  lon,
  representative_flag::BOOLEAN  -- raw が INTEGER の場合
FROM address_raw
WHERE lat IS NOT NULL
  AND lon IS NOT NULL;


UPDATE address_master
SET geom = ST_SetSRID(ST_MakePoint(lon, lat), 4326)
WHERE lat IS NOT NULL
  AND lon IS NOT NULL;


CREATE INDEX idx_address_master_geom
ON address_master
USING GIST (geom);
