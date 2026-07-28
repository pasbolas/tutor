--WEEK 4, Part 2: SET operations
--Examples using the football schema
--Check the data types
SELECT DISTINCT pg_typeof(player_id) FROM players;
SELECT DISTINCT pg_typeof(club_id) FROM clubs;

--Will result in an error as data types are different
SELECT player_id, 'players' "Source table" --we manually create another column with the name of the table
FROM players
UNION
SELECT club_id, 'clubs' "Source table"
FROM clubs;

--Casting to make it work
SELECT player_id::text, 'players' "Source table"
FROM players
UNION
SELECT club_id, 'clubs' "Source table"
FROM clubs;

--We can order by the first attribute selected
SELECT player_id::text, 'players' "Source table"
FROM players
UNION
SELECT club_id, 'clubs' "Source table"
FROM clubs ORDER BY player_id;

--If we try to order by the second attribute, we get an error as it no longer exists -- it was merged with the first one
SELECT player_id::text, 'players' "Source table"
FROM players
UNION
SELECT club_id, 'clubs' "Source table"
FROM clubs ORDER BY club_id;

--UNION ALL
SELECT jersey_number, 'player_attributes' "Source table"
FROM player_attributes
UNION ALL
SELECT jersey_number, 'player_contracts' "Source table"
FROM player_contracts ORDER BY 1;


--INTERSECT: Players that have data on attributes and have contracts
SELECT player_id
FROM player_contracts 
INTERSECT ALL
SELECT player_id
FROM player_attributes;

--EXCEPT: Players that have data on attributes but no contract
SELECT player_id
FROM players
EXCEPT
SELECT player_id
FROM player_contracts;

--We can confirm the number using count in a join
SELECT COUNT(*)
FROM players
LEFT JOIN player_contracts USING (player_id)
WHERE player_contracts.player_id IS NULL;


--Explain Analyze to compare efficiency
--Casting to make it work
EXPLAIN ANALYZE SELECT player_id::text, 'players' "Source table"
FROM players
UNION
SELECT club_id, 'clubs' "Source table"
FROM clubs;

EXPLAIN ANALYZE SELECT player_id::text, club_id from players join player_contracts using (player_id)
join clubs using (club_id);



