---------------------
--Aggregate Functions
---------------------

--Count()
-- Total number of rows in each key table (simple counts)
SELECT COUNT(*) "Total players" FROM players;
SELECT COUNT(*) "Total clubs"   FROM clubs;
SELECT COUNT(*) "Total contracts" FROM player_contracts;
SELECT COUNT(*) "Total attributes" FROM player_attributes;

-- Using subqueries to count all rows in one unique query
SELECT
(SELECT COUNT(player_id) FROM players) "Total number of players",
(SELECT COUNT(club_id) FROM clubs) "Number of clubs",
(SELECT COUNT(DISTINCT player_id) FROM player_attributes) "Number of players with attributes",
(SELECT COUNT(DISTINCT player_id) FROM player_contracts) "Number of players with contracts";

-- Count only contracts that have a non-null wage
SELECT COUNT(wage) "Contracts with wage" FROM player_contracts;

-- How many distinct clubs appear in the contracts table?
SELECT COUNT(DISTINCT club_id) "Unique wage values" FROM player_contracts;

--count( ) and group by
SELECT
  club_name,
  COUNT(player_contracts.player_id) "Players with contract"
FROM clubs
LEFT JOIN player_contracts USING (club_id)
GROUP BY club_name;

--grouping by multiple columns
-- Average wage per club and country
SELECT
  club_name,
  nationality,
  ROUND(AVG(wage), 2) "Average wage"
FROM player_contracts
JOIN players USING (player_id)
JOIN clubs USING (club_id)
GROUP BY club_name, nationality
ORDER BY 2, 3 DESC;


--avg()
-- Average wage per club (ignore NULL wages by default)
SELECT
  club_name,
  ROUND(AVG(player_contracts.wage), 2) "Average wage"
FROM clubs
JOIN player_contracts USING (club_id)
GROUP BY club_name
ORDER BY 2 DESC;

-- Average overall per nationality
SELECT
  nationality,
  AVG(overall) "Average overall"
FROM players
JOIN player_attributes USING (player_id)
GROUP BY nationality
ORDER BY 2 DESC;

--Combining avg( ) and count( )
SELECT nationality "Nationality",
COUNT(*) "Number of players",
ROUND(AVG(age), 1) "Average age"
FROM players
GROUP BY nationality
ORDER BY 2 DESC;

--sum( )
--How much each club spends on wage
SELECT
  clubs.club_name,
  SUM(wage) "Wage bill"
FROM clubs
JOIN player_contracts USING (club_id)
GROUP BY club_name
ORDER BY 2 DESC;

--min( ) and max( )
-- Highest and lowest player wage overall
SELECT
  MIN(wage) "Minimum wage",
  MAX(wage) "Maximum wage"
FROM player_contracts;

-- Earliest and latest contract end dates
SELECT
  MIN(joined) "Earliest contract",
  MAX(contract_valid_until) "Latest contract"
FROM player_contracts;

--Min and max dealing with strings
SELECT 
MIN(player_name),
MAX(player_name)
FROM players;

--WHERE x HAVING

-- When we add group functions to the selecting condition, using WHERE does not work  

-- Clubs with average wage higher than 50,000
SELECT club_id, ROUND(AVG(wage), 2) "Average wage"
FROM player_contracts
GROUP BY club_id
WHERE AVG(wage) > 50000;

-- For each club: total players (via contracts), with wage, without wage

SELECT
  club_name FILTER (WHERE club_name IS NOT NULL),
  COUNT(player_id),
  COUNT(player_id) FILTER (WHERE wage IS NOT NULL) "With wage",
  COUNT(player_id) FILTER (WHERE wage IS NULL) "Without wage"
FROM clubs
LEFT JOIN player_contracts USING (club_id)
GROUP BY club_name
ORDER BY club_name;


--Nesting aggregates -- not allowed
--The highest average wage (returns an error)
SELECT 
  MAX(AVG(wage)) 
FROM player_contracts;

--We can retrieve that data using a subquery
SELECT ROUND(MAX("Average wage"), 2) "Maximum wage" --notice I can nest round and max because round is a single-row function
FROM (
  SELECT AVG(wage) "Average wage"
  FROM player_contracts
  GROUP BY club_id
) "Subquery";


--string_agg( )
-- All player full names in a single comma-separated string per club, alphabetically
SELECT
  club_name,
  STRING_AGG(player_name, ', ' ORDER BY players.player_name) "Players list"
FROM clubs
JOIN player_contracts USING (club_id)
JOIN players USING (player_id)
GROUP BY club_name
ORDER BY club_name;

--Dashboard combining different functions
SELECT
 club_name,
  COUNT(DISTINCT player_id) "Number of players",
  ROUND(AVG(wage), 2)  "Average wage",
  SUM(wage) "Total wage bill",
  MIN(wage) "Minimum wage",
  MAX(wage) "Maximum wage",
  COUNT(*) FILTER (WHERE contract_valid_until <= EXTRACT(YEAR FROM CURRENT_DATE)) "Number of valid contracts",
  STRING_AGG(DISTINCT player_name, ', ' ORDER BY player_name) "Players list"
FROM clubs
LEFT JOIN player_contracts USING (club_id)
LEFT JOIN players USING (player_id)
GROUP BY club_name
ORDER BY 3 DESC NULLS LAST;

