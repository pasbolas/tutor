--Step 1: Understand the structure
-- 1.1 List all base tables in the schema
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'football'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 1.2 Identify columns, data types, nullability (repeat the block for any table)
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'football' AND table_name = 'clubs'
ORDER BY ordinal_position;

SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'football' AND table_name = 'clubs'
ORDER BY ordinal_position;

SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'football' AND table_name = 'player_attributes'
ORDER BY ordinal_position;

SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'football' AND table_name = 'player_contracts'
ORDER BY ordinal_position;

-- 1.3 Identify constraints for all tables
SELECT table_name, constraint_name, constraint_type FROM information_schema.table_constraints WHERE table_schema = 'football';

--Step 2: count and preview the data


-- 2.1 Cross-table coverage
SELECT
  (SELECT COUNT(player_id) FROM players) "Total number of players",
  (SELECT COUNT(club_id) FROM clubs) "Number of clubs",
  (SELECT COUNT(DISTINCT player_id) FROM player_attributes) "Number of players with attributes",
  (SELECT COUNT(DISTINCT player_id) FROM player_contracts)  "Number of players with contracts";


-- Data preview
-- 2.2 Show the first 10 rows of a table
SELECT * FROM players LIMIT 10;

-- 2.3 Show distinct values of a column
SELECT DISTINCT nationality
FROM players;

-- Random sample of 5 rows
SELECT * FROM players ORDER BY RANDOM() LIMIT 5;

-- Preview top players by rating
SELECT player_id, overall
FROM player_attributes
ORDER BY overall DESC
LIMIT 10;



-- 2.4 Contract date & expiry coverage
SELECT
  MIN(joined) "First contract date",
  MAX(joined) "Last contract date",
  MIN(contract_valid_until) "Minimum expiry year",
  MAX(contract_valid_until)  "Maximum expiry year"
FROM player_contracts;

-- 2.5 Clubs with most contracts
SELECT club_name, COUNT(*) "Number of contracts"
FROM player_contracts
JOIN clubs USING (club_id)
GROUP BY club_name
ORDER BY 2 DESC
LIMIT 10;

--Step 3: Data quality checks
-- 3.1 Null profiling

SELECT
  COUNT(*) "Total number of rows",
  COUNT(*) FILTER (WHERE heading_accuracy IS NULL) "Number of rows where heading accuracy is NULL",
  COUNT(*) FILTER (WHERE weight IS NULL)  "Number of rows where weight is NULL",
    COUNT(*) FILTER (WHERE overall IS NULL)  "Number of rows where overall is NULL"
FROM player_attributes;

-- 3.2 Duplicates
-- Multiple attribute rows for the same player (unexpected in this design)
SELECT player_id, COUNT(*) "Rows per player"
FROM player_attributes
GROUP BY player_id
HAVING COUNT(*) > 1
ORDER BY 2 DESC;

-- Multiple contract rows per player (may be legit historically; still inspect)
SELECT player_id, COUNT(*) "Number of contracts"
FROM player_contracts
GROUP BY player_id
HAVING COUNT(*) > 1
ORDER BY 2 DESC;

-- 3.3 Orphaned references (should be zero if FKs are enforced)
-- Players with contracts pointing to non-existent clubs
SELECT pc.player_contract_id,
       pc.player_id,
       pc.club_id,
       pc.joined,
       pc.contract_valid_until
FROM player_contracts pc
LEFT JOIN clubs c
  USING (club_id)
WHERE c.club_id IS NULL;


-- Step 4: Descriptive statistics
-- 4.1 Summaries
-- Basic descriptive statistics for age
SELECT
  COUNT(*) "Total players",
  COUNT(age) "Total players with age value",
  MIN(age) "Minimum value for age",
  MAX(age) "Maximum value for age",
  AVG(age) "Average value for age"
FROM players;


-- 4.2 Descriptive statistics in a context
SELECT nationality "Nationality",
       COUNT(*) "Number of players",
       ROUND(AVG(age), 0) "Average age"
FROM players
GROUP BY nationality
ORDER BY 2 DESC;

--Step 5: Relationships

--5.1 Overview of main attributes of all tables

SELECT
  player_name,
  overall,
  potential,
  wage,
  club_name
FROM players
JOIN player_attributes USING (player_id)
JOIN player_contracts USING (player_id)
JOIN clubs USING (club_id) order by wage desc;

-- 5.2 Club spend vs average rating
SELECT club_name "Club",
       COUNT(*) "Number of players",
       SUM(wage) "Spent on wage",
       ROUND(AVG(overall)) "Overall rate"
FROM player_contracts
JOIN clubs USING (club_id)
LEFT JOIN player_attributes USING (player_id)
GROUP BY club_name
ORDER BY 3 DESC NULLS LAST;


--5.4 Attributes but no contract
SELECT p.player_id, p.player_name, pc.player_contract_id
FROM players p
JOIN player_attributes pa USING (player_id)
LEFT JOIN player_contracts pc USING (player_id)
WHERE pc.player_id IS NULL
ORDER BY p.player_name;



--Step 6: Anomalies and outliers
--6.1 Contract ends before start date
SELECT player_id, joined, contract_valid_until
FROM player_contracts
WHERE contract_valid_until IS NOT NULL
  AND joined IS NOT NULL
  --joined is a date data type, we need to extract the year
  AND EXTRACT(YEAR FROM joined) > contract_valid_until;

-- 6.2 Unrealistic values
SELECT player_id, player_name, age
FROM players
WHERE age < 14 OR age > 50;



--6.3 Outliers - wage
SELECT
distinct p.player_id,
  p.player_name,
  c.club_name,
  pc.wage,
  pa.overall,
  --we use a subquery because avg() expects a group by at the end
  ROUND(pc.wage / (SELECT AVG(wage) FROM player_contracts WHERE wage IS NOT NULL), 2) "Times above the average"
FROM player_contracts pc
JOIN players p USING (player_id)
LEFT JOIN player_attributes pa USING (player_id)
LEFT JOIN clubs c USING (club_id)
WHERE pc.wage IS NOT NULL
ORDER BY pc.wage DESC LIMIT 10;

