# Week 11 - Query optimisation, transactions and triggers


## Query optimisation, common table expressions, transactions, and triggersDr Mariana RochaSchool of Computer Science

- CPMU 2007 Databases 1, Lecture 11

## Query optimisation

- Improve performance and reduce execution time
- Reduce load on the database server
- Improve scalability for large datasets
- Make application code more efficient and stable
- We can use a number of strategies to optimise our queries

## Slide 3


## LIMIT number of results

- In large tables like player_statistics, a plain SELECT * can be slow and unnecessary.
- When we just want to peek at the data, we can use LIMIT to restrict the number of rows.
- This is useful when exploring a new table or debugging queries.
- Using LIMIT also makes EXPLAIN ANALYZE faster and easier to read.
- -- Without LIMIT: reads the whole table
- EXPLAIN ANALYZE
- SELECT *
- FROM nba.player_statistics;
- -- With LIMIT: just sample 10 rows
- EXPLAIN ANALYZE
- SELECT *
- FROM nba.player_statistics
- LIMIT 10;

## Use JOINS instead of subqueries

- We have learned subqueries can be very useful to retrieve data from tables that are not connected
- However, they are not very efficient as the system needs to access each table individually and work on them as sets
- If the tables are connected, give preference to JOINs, as they access one table and, through the connected attribute, access the second table.

## Use JOINS instead of subqueries

- --JOIN X SUBQUERY
- -- Get the city of the home team for each game
- --Using a SUBQUERY
- EXPLAIN ANALYZE SELECT game_id,
- (SELECT team_city
- FROM nba.teams t
- WHERE t.team_id = g.home_team_id) AS home_city
- FROM nba.games g;
- --Using a JOIN: notice how team_id is treated like an index that facilitates data identification
- EXPLAIN ANALYZE SELECT game_id,
- team_city "Home city"
- FROM games g
- JOIN teams t
- ON (t.team_id = g.home_team_id);

## PREPARE

- The PREPARE statement allows to define a query once and reuse it multiple times with different parameters
- The database server parses, plans, and optimizes the query once when the PREPARE statement is executed.
- A placeholder ($1, $2, etc.) is used for parameters in the query.
- For queries that are executed frequently or in loops, using PREPARE significantly reduces execution time.

## PREPARE

- --PREPARE
- -- Prepare a parameterised query: (int, text)
- PREPARE get_player_stats (int, text) AS
- SELECT ps.game_id,
- ps.points,
- ps.assists,
- ps.rebounds_total,
- g.game_date,
- g.game_type
- FROM player_statistics ps
- JOIN games g USING (game_id)
- WHERE ps.person_id = $1 -- player id
- AND g.game_type = $2; -- for example, 'Regular Season', 'Playoffs'

## SPECIFIC QUERIES

- Avoid SELECT * in production queries:
  - Unnecessary I/O (reads columns we do not use).
  - Queries break if later columns are added or removed.
  - Instead, select only the columns you need and filter rows early.
- --Avoid SELECT *
- SELECT *
- FROM nba.player_statistics
- WHERE points > 30;
- --Prefer specifying the columns
- SELECT person_id,
- game_id,
- points,
- assists,
- rebounds_total
- FROM nba.player_statistics
- WHERE points > 30;

## Transactions

- Transactions group SQL statements into atomic, consistent, isolated, and durable operations.
- Transactions encapsulate multiple steps into a single, all-or-nothing operation.
- The intermediate states between the steps are not visible to other concurrent transactions.
- Therefore, if anything goes wrong, it prevents the transaction from completing, then none of the steps affect the database at all.

## Transactions

- BEGIN: A transaction always starts with the BEGIN keyword, indicating to the DB a transaction is starting, with multiple in it.
- COMMIT: keyword used so the changes made by the transaction are effective. All the queries after the COMMIT persist in the database.
- ROLLBACK: Allows us to undo changes promoted by the queries. If the system crashes during the transaction after writing thousands of queries, we are able to rollback.

## Transactions

- In an NBA context, imagine correcting stats for a game:
  - Remove the old stats rows for a game.
  - Insert corrected stats.
  - Update the game’s final score.
- Either all of these changes should happen, or none.

## Transactions

- -- 1. Start the transaction
- BEGIN;
- -- 2. Delete old statistics
- DELETE FROM player_statistics
- WHERE game_id = 22400677;
- -- 3. Insert corrected statistics
- INSERT INTO player_statistics (
- person_id, game_id, game_date,
- points, assists, rebounds_total
- )
- VALUES
- (201939, 22400677, '2025-11-01', 32, 8, 5),
- (2544, 22400677, '2025-11-01', 28, 7, 9);
- -- 4. Update the game final score
- UPDATE games
- SET home_score = 110,
- away_score = 105
- WHERE game_id = 22400677;

## ACID Properties

- Transactions follow the principals of ACID properties:
  - Atomicity – all or nothing. Example: Adjusting stats for a game involves deleting old stats and inserting corrected ones. If the insertion fails, none of the deletions or updates should be kept.
  - Consistency – valid state. Example: After a game is updated, home_score and away_score must still equal the sum of individual players’ points, and foreign keys (home_team_id, away_team_id) must still reference valid teams.
  - Isolation – independent execution. Example: Two analysts might be editing stats for different games at the same time. Each transaction should not see the other’s intermediate, half-finished changes.
  - Durability – permanent changes. Example: Once corrected stats for the NBA finals are committed, the database guarantees that those changes will survive a server restart or power failure.

## Trigger

- A trigger specifies that the database should automatically execute a particular function whenever a certain type of operation is performed.
- Triggers can be performed on tables, being executed before or after an INSERT, UPDATE or DELETE statement.

## Trigger

- A trigger in the NBA schema can automatically:
  - Update a team’s total wins/losses when a game is inserted.
  - Maintain a summary table with each player’s career totals whenever player_statistics changes.
  - We can define triggers as row-level (per row) or statement-level (per statement).

## Trigger

- Triggers can be:
  - Row-Level Trigger ensures immediate updates for individual inserts.
  - Statement-Level Trigger ensures consistency after bulk operations, catching any discrepancies caused by operations like manual changes or bulk inserts.
  - The differences between the two kinds are how many times the trigger is invoked and at what time. For example, if you issue an UPDATE statement that modifies 20 rows, the row-level trigger will be invoked 20 times, while the statement-level trigger will be invoked only once.

## Trigger

- Use ROW-LEVEL trigger when:
  - Your logic depends on the individual values of each inserted/updated row
  - You need to modify the row before it is stored
  - You want consistent per-row behaviour
- Use STATEMENT-LEVEL trigger when:
  - Your logic applies to the whole table, not individual rows
  - You are working with bulk operations (INSERT…SELECT, UPDATE many rows)
  - You want to avoid running the same logic hundreds or thousands of times

## Common Table Expression (CTE)

- Temporary result set that can be referenced within a SELECT, INSERT, UPDATE, or DELETE statement.
- It provides a way to break down complex queries into more manageable and readable parts.
- Good for multi-step calculations. In our NBA example: finding top scorers per team, or average points per game.

## Common Table Expression (CTE)

- Even though CTEs and Views are used to reorganise and reuse data, they have different purposes.
- A CTE is temporary and only exists for the duration of that query.
- Views are persistent and can be queried like regular tables.
