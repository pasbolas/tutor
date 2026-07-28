-- WEEK 8: Conditional expressions and subqueries

--Simple CASE
SELECT
    p.player_name,
    pa.position,
    CASE pa.position
        WHEN 'GK' THEN 'Goalkeeper'
        WHEN 'CB' THEN 'Defender'
        WHEN 'RB' THEN 'Defender'
        WHEN 'LB' THEN 'Defender'
        WHEN 'CM' THEN 'Midfielder'
        WHEN 'CDM' THEN 'Midfielder'
        WHEN 'CAM' THEN 'Attacker'
        WHEN 'LW' THEN 'Attacker'
        WHEN 'RW' THEN 'Attacker'
        WHEN 'ST' THEN 'Attacker'
        ELSE 'Other / Utility'
    END "Position category"
FROM players p
JOIN player_attributes pa USING (player_id)
LIMIT 15;


--Search CASE
SELECT
    pc.player_id,
    p.player_name,
    pc.wage,
    CASE
        WHEN pc.wage >= 50000 THEN 'Tier 1: Elite'
        WHEN pc.wage >= 10000 THEN 'Tier 2: First Team'
        WHEN pc.wage >= 2000  THEN 'Tier 3: Rotation'
        WHEN pc.wage IS NULL THEN 'No contract / unknown'
        ELSE 'Tier 4: Youth / Low cost'
    END "Salary band" 
FROM player_contracts pc
JOIN players p USING (player_id);

--CASE and WHERE
SELECT
    p.player_name,
    c.club_name,
    pc.wage
FROM players p
JOIN player_contracts pc USING (player_id)
JOIN clubs c USING (club_id)
WHERE
    pc.wage >
    CASE
        WHEN c.club_name IN ('Real Madrid', 'Chelsea') THEN 50000
        ELSE 5000
    END
ORDER BY c.club_name, pc.wage DESC;



--CASE and Maths
SELECT
    p.player_name,
    c.club_name,
    pc.wage,
    CASE
        WHEN pc.wage < 10000 THEN pc.wage * 1.10
        WHEN pc.wage BETWEEN 10000 AND 50000 THEN pc.wage * 1.05 
        ELSE pc.wage                                 
    END "Projected wage"
FROM players p
JOIN player_contracts pc USING (player_id)
JOIN clubs c USING (club_id)
WHERE pc.wage IS NOT NULL
ORDER BY c.club_name, pc.wage DESC;

--CASE and functions
SELECT
    c.club_name,
    ROUND(AVG(pc.wage)) "Average wage",
    CASE
        WHEN AVG(pc.wage) >= 40000 THEN 'High Budget Club'
        WHEN AVG(pc.wage) BETWEEN 10000 AND 39999 THEN 'Medium Budget Club'
        WHEN AVG(pc.wage) < 10000 THEN 'Low Budget Club'
        ELSE 'No Data'
    END "Budget category"
FROM clubs c
JOIN player_contracts pc USING (club_id)
WHERE pc.wage IS NOT NULL
GROUP BY c.club_name
ORDER BY AVG(pc.wage) DESC;

--CASE and LIKE
SELECT
    p.player_name,
    CASE
        WHEN p.player_name LIKE '%Junior%' THEN 'Brazilian-style name'
        WHEN p.player_name LIKE '%inho' THEN 'Brazilian-style name'
        ELSE 'Other pattern'
    END AS name_pattern
FROM players p
ORDER BY 2 ASC;

--CASE and ORDER BY
SELECT
    p.player_name,
    pa.position,
    pa.overall
FROM players p
JOIN player_attributes pa USING (player_id)
ORDER BY
    CASE
        WHEN pa.position IN ('ST', 'LW', 'RW', 'CAM') THEN 1   -- Attackers
        WHEN pa.position IN ('CM', 'CDM', 'LM', 'RM') THEN 2   -- Midfielders
        WHEN pa.position IN ('CB', 'LB', 'RB', 'RWB', 'LWB') THEN 3  -- Defenders
        WHEN pa.position = 'GK' THEN 4                          -- Goalkeepers
        ELSE 5                                                  -- Unknown / other
    END;






--Single-row subquery
SELECT
    p.player_name,
    pc.wage
FROM players p
JOIN player_contracts pc USING (player_id)
WHERE pc.wage >
    (SELECT AVG(wage) FROM player_contracts);


--combining single-row subqueries
SELECT p.player_name, pc.wage
FROM players p
JOIN player_contracts pc USING (player_id)
WHERE pc.wage > (
        SELECT MAX(wage) FROM player_contracts WHERE club_id = 'CL137'  -- Chelsea
      )
AND pc.value > (
        SELECT AVG(value) FROM player_contracts WHERE club_id = 'CL473'  -- Real Madrid
      );

--Exists
SELECT c.club_id, c.club_name
FROM clubs c
WHERE EXISTS (
    SELECT 1
    FROM player_contracts pc
    WHERE pc.club_id = c.club_id --we want a club_id that is also in the clubs table
      AND pc.wage >= 50000
);

--IN
SELECT
    p.player_name,
    c.club_name,
    pc.wage
FROM players p
JOIN player_contracts pc USING (player_id)
JOIN clubs c USING (club_id)
WHERE pc.club_id IN (
    SELECT DISTINCT club_id
    FROM player_contracts
    WHERE wage >= 50000
);



--NOT IN
SELECT
    p.player_name
FROM players p
WHERE p.player_id NOT IN (
    SELECT player_id
    FROM player_contracts
);

--ANY
SELECT
    p.player_name,
    pc.wage
FROM players p
JOIN player_contracts pc USING (player_id)
WHERE pc.wage > ANY (
    SELECT wage
    FROM player_contracts
    WHERE club_id = 'CL137'   -- Chelsea
);

--ALL
SELECT
    p.player_name,
    pc.wage
FROM players p
JOIN player_contracts pc USING (player_id)
WHERE pc.wage > ALL (
    SELECT wage
    FROM player_contracts
    WHERE club_id = 'CL137'   -- Chelsea
);

 --DELETE
DELETE FROM player_contracts
WHERE contract_valid_until < 2020;

SELECT * FROM player_contracts WHERE contract_valid_until < 2020;

--TRUNCATE
TRUNCATE TABLE player_attributes;

--UPDATE
UPDATE player_contracts
SET wage = wage * 1.10
WHERE wage < 10000;

--UPDATE with subquery
UPDATE player_contracts
SET wage = (
    SELECT ROUND(AVG(wage))
    FROM player_contracts
    WHERE wage IS NOT NULL
)
WHERE wage IS NULL;
