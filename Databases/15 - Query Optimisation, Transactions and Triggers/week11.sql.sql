--Week 11
--Let's start by checking how big this schema is
SELECT
(SELECT COUNT(*) FROM players) "Rows in players",
(SELECT COUNT(*) FROM player_statistics) "Rows in player_statistics",
(SELECT COUNT(*) FROM games)
"Rows in games",
(SELECT COUNT(*) FROM teams) "Rows in teams";

--LIMIT
-- Without LIMIT: reads the whole table
EXPLAIN ANALYZE
SELECT * 
FROM player_statistics;

-- With LIMIT: just sample 10 rows
EXPLAIN ANALYZE
SELECT * 
FROM player_statistics
LIMIT 10;

--JOIN X SUBQUERY
-- Get the city of the home team for each game
--Using a SUBQUERY
EXPLAIN ANALYZE SELECT game_id,
       (SELECT team_city
        FROM nba.teams t
        WHERE t.team_id = g.home_team_id) AS home_city
FROM nba.games g;

--Using a JOIN: notice how team_id is treated like an index that facilitates data identification
EXPLAIN ANALYZE SELECT game_id,
       team_city "Home city"
FROM games g
JOIN teams t
  ON (t.team_id = g.home_team_id);


--PREPARE
-- Prepare a parameterised query: (int, text)
PREPARE get_player_stats (int, text) AS
SELECT ps.game_id,
       ps.points,
       ps.assists,
       ps.rebounds_total,
       g.game_date,
       g.game_type
FROM player_statistics ps
JOIN games g USING (game_id)
WHERE ps.person_id = $1      -- player id
  AND g.game_type = $2;      -- for example, 'Regular Season', 'Playoffs'

--without prepare
EXPLAIN ANALYZE
SELECT ps.game_id,
       ps.points,
       ps.assists,
       ps.rebounds_total,
       g.game_date,
       g.game_type
FROM nba.player_statistics ps
JOIN nba.games g USING (game_id)
WHERE ps.person_id = 1626157     
  AND g.game_type = 'Regular Season';

--with prepare
EXPLAIN ANALYZE
EXECUTE get_player_stats(1626157, 'Regular Season');

--Specific queries
--Avoid SELECT *
SELECT * 
FROM nba.player_statistics
WHERE points > 30;

--Prefer specifying the columns
SELECT person_id,
       game_id,
       points,
       assists,
       rebounds_total
FROM nba.player_statistics
WHERE points > 30;


-- 0. Inspect current data BEFORE starting the transaction
SELECT *
FROM player_statistics
WHERE game_id = 22400677;

-- 1. Start the transaction
BEGIN;

    -- 2. Delete old statistics
    DELETE FROM player_statistics
    WHERE game_id = 22400677;

    -- 3. Insert corrected statistics
    INSERT INTO player_statistics (
        person_id, game_id, game_date,
        points, assists, rebounds_total
    )
    VALUES
        (201939, 22400677, '2025-11-01', 32, 8, 5),
        (2544,   22400677, '2025-11-01', 28, 7, 9);

    -- 4. Update the game final score
    UPDATE games
    SET home_score = 110,
        away_score = 105
    WHERE game_id = 22400677;

    -- 5. Inspect the data BEFORE committing
    SELECT *
    FROM player_statistics
    WHERE game_id = 22400677;

-- 6. If the results look good, run:
-- COMMIT;

-- 7. If anything is wrong, run:
--ROLLBACK;

--Trigger
--Row-level trigger
--We start by creating a funcion that will work as a trigger
CREATE OR REPLACE FUNCTION set_plus_minus_row()
RETURNS TRIGGER AS $$
BEGIN
    -- As we include a new row, the following will recalculate plus_minus_points considering the new values
	--plus_minus_points checks the difference between the team and the opponent's points
	--we assign values to variables using := in plpsql
    NEW.plus_minus_points := NEW.points - NEW.turnovers;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--trigger
CREATE TRIGGER trg_plus_minus_row
BEFORE INSERT ON player_statistics
FOR EACH ROW
EXECUTE FUNCTION set_plus_minus_row();

--statement level
--create function
CREATE OR REPLACE FUNCTION update_plus_minus_all()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate the derived value for ALL rows at once
    UPDATE player_statistics
    SET plus_minus_points = points - turnovers;

    RETURN NULL;  -- statement-level triggers return NULL
END;
$$ LANGUAGE plpgsql;

--create trigger
CREATE TRIGGER trg_plus_minus_statement
AFTER INSERT ON player_statistics
FOR EACH STATEMENT
EXECUTE FUNCTION update_plus_minus_all();

--CTE
--First we compute each player’s average points in the CTE
--Then we filter that result and only keep players averaging at least 20 points per game
--This is easier to read than nesting the whole AVG and GROUP BY inside one big SELECT
WITH player_avg AS (
    SELECT person_id,
           AVG(points) AS avg_points
    FROM player_statistics
    GROUP BY person_id
)
SELECT person_id,
       avg_points
FROM player_avg
WHERE avg_points >= 20
ORDER BY avg_points DESC;


