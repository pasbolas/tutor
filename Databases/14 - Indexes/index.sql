-- Example query
EXPLAIN ANALYZE SELECT * FROM booking WHERE customer_id = 'C09142';

--Creating index
DROP INDEX IF EXISTS idx_booking_customer;
CREATE INDEX idx_booking_customer ON booking (customer_id);

--Checking the time again
EXPLAIN ANALYZE SELECT * FROM booking WHERE customer_id = 'C09142';

--Composite indexes
--Before index
EXPLAIN ANALYZE SELECT * FROM customer WHERE customer_fname = 'Alice Anderson' AND city = 'San Francisco';

DROP INDEX IF EXISTS idx_customer_name_city;

CREATE INDEX idx_customer_name_city
ON customer (customer_fname, city);

EXPLAIN ANALYZE SELECT * FROM customer WHERE customer_fname = 'Alice Anderson' AND city = 'San Francisco';

--Memory check
--How much disk space the rows themselves take
SELECT pg_size_pretty(pg_relation_size('customer')) AS table_size;)

--How much storage one specific index consumes.
SELECT pg_size_pretty(pg_relation_size('idx_customer_name_city')) AS table_size;)


--deciding the data structure for your index
EXPLAIN ANALYZE SELECT * FROM booking WHERE price_paid BETWEEN 10 AND 50;

DROP INDEX idx_price;
CREATE INDEX idx_price ON booking USING btree(price_paid);

EXPLAIN ANALYZE SELECT * FROM booking WHERE price_paid BETWEEN 10 AND 50;

--checking data structure
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'booking' AND indexname = 'idx_price';

--partial index
DROP INDEX idx_large_stages; 
CREATE INDEX idx_large_stages ON stage (stage_name) WHERE audience_capacity > 100;



--joins
DROP INDEX IF EXISTS idx_concert_artist, idx_booking_concert;
CREATE INDEX IF NOT EXISTS idx_concert_artist  ON concert(artist_id);
CREATE INDEX IF NOT EXISTS idx_booking_concert ON booking(concert_id);

EXPLAIN ANALYZE
SELECT artist_name, SUM(price_paid)
FROM booking 
JOIN concert  USING (concert_id)
JOIN artist   USING (artist_id)
WHERE artist_name = 'Lady Gaga Band'           
GROUP BY artist_name;


CREATE INDEX idx_lower_city ON customer (LOWER(city));


--order by
DROP INDEX IF EXISTS idx_booking_price;
CREATE INDEX idx_booking_price ON booking (price_paid);

EXPLAIN ANALYZE
SELECT booking_id, price_paid
FROM booking
ORDER BY price_paid; -- we can add DESC as well


--unique index
--if i create a column
ALTER TABLE customer ADD COLUMN email_address TEXT;
-- update all values to the same
UPDATE customer SET email_address = 'customer@gmail.com';
--it works because there is no unique constraint
SELECT * FROM customer;

--however, let's drop the column and create it again
ALTER TABLE customer DROP COLUMN email_address;
ALTER TABLE customer ADD COLUMN email_address TEXT;
--the column is empty
SELECT * FROM customer;

--create an unique index
DROP INDEX IF EXISTS idx_customer_email;
CREATE UNIQUE INDEX idx_customer_email ON customer (email_address);

--try to update to duplicate values - it's not going to work
UPDATE customer SET email_address = 'customer@gmail.com';



--index on expression
EXPLAIN ANALYZE
SELECT *
FROM customer
WHERE LOWER(customer_fname) = 'john doe';


DROP INDEX IF EXISTS idx_customer_fname_lower;
CREATE INDEX idx_customer_fname_lower
ON customer (LOWER(customer_fname));

