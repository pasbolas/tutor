--Q1 - Using a join, retrieve the player name, nationality, club name, and wage for all players currently under contract. Display the data in descending order for the wage attribute.
SELECT 
    player_name, 
    nationality, 
    club_name, 
    wage
FROM players
JOIN player_contracts USING (player_id)
JOIN clubs USING (club_id)
ORDER BY wage DESC;

--Q2 - Using a set operator, find player IDs that appear in both player_contracts and player_attributes.

SELECT player_id FROM player_contracts
INTERSECT
SELECT player_id FROM player_attributes;

--Q3 - Using a set operator, create a list of all player and club IDs in one column named IDs.
SELECT player_id::text "IDs" FROM players
UNION
SELECT club_id FROM clubs;


--Q4 - Using a join, find all players who have contracts but no attribute data recorded.
SELECT 
    p.player_name, 
    c.club_name
FROM player_contracts pc
JOIN players p USING (player_id)
LEFT JOIN player_attributes pa USING (player_id)
JOIN clubs c USING (club_id)
WHERE pa.player_id IS NULL;

--Q5 - Using a set operator, find the id of players who exist in the players table but do not have a contract
SELECT player_id FROM players
EXCEPT
SELECT player_id FROM player_contracts;
