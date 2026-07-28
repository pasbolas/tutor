--Lecture 6: Number functions
--The examples below demonstrate the application of SQL NULL, number and date functions into the university research database

--NULLIF: supposed SFI does not want to be displayed as a sponsor
SELECT sponsor, nullif(sponsor, 'SFI') FROM grant_funding;

--Coalesce: used to replace NULL values with the first not null value on a list
SELECT coalesce(birth_date::text,firstname) FROM scientist;

--Greatest: return the greatest value among a few
SELECT research_id, title, GREATEST(end_date, CURRENT_DATE) "Most recent date" FROM research;

--Least: return the smallest value among a few
SELECT research_id, title, LEAST(end_date, CURRENT_DATE) "Most recent date" FROM research;

--Round
SELECT grant_id, amount, ROUND(amount, 1) "Rounded amount" FROM grant_funding; --we could also do round(amount)for no decimal number

--Ceil, floor and round
SELECT grant_id, amount, ROUND(amount) "Round", ceil(amount) "Round up", floor(amount) "Round down" FROM grant_funding; 

--Rounding with negative second argument
SELECT ROUND(450.9234), ROUND(450.9234,-1)/*nearest 10s*/, ROUND(450.9234,-2)/*nearest 100s*/, ROUND(450.9234,-3)//*nearest 1000s*/;

--Truncate
SELECT TRUNC(450.923, -1)/*truncate to nearest 10s*/, 
TRUNC(450.923,-2), TRUNC(450.923,-3) /*truncate to nearest 100s*/;

--Mod: Committee allocation
SELECT
    research_id,
    title,
    MOD(research_id, 3) "Assigned committee"
FROM research r
ORDER BY 3;

--to_char
SELECT birth_date, to_char(birth_date, 'DD/MM/YYYY') FROM scientist;


--abs( ): Suppose we want to know the difference in days between the end of the research and the end of grant. We do not want negative values, though
SELECT r.end_date "Research ends", g.end_date "Grant ends", abs(g.end_date - r.end_date) "Days variance" FROM research r JOIN research_grant rg USING (research_id) JOIN grant_funding g USING (grant_id);

--current time
SELECT now();
SELECT current_date;

--current time data type
SELECT pg_typeof(now());

--date in a week from now
SELECT current_date + 7;

--calculate scientist's age
SELECT age(birth_date) FROM scientist;

--calculate projects's age
SELECT age(begin_date) FROM research;

--project duration in weeks
SELECT (end_date - begin_date) / 7 from research;

--cast
SELECT pg_typeof(cast(begin_date AS TEXT)) FROM research;

SELECT pg_typeof(amount::text) FROM grant_funding;

--to_char with dates
SELECT firstname, TO_CHAR(birth_date, 'fmDD Month YYYY') FROM scientist;
SELECT firstname, TO_CHAR(birth_date, 'Month DDspth') FROM scientist;

--currency sign
SELECT to_char(amount, '€999,999.99') FROM grant_funding;

--PL/pgSQL
CREATE OR REPLACE FUNCTION get_project_status(begin_d DATE, end_d DATE)
RETURNS TEXT AS $$
BEGIN
   IF current_date BETWEEN begin_d AND end_d THEN
      RETURN 'Active';
   ELSEIF current_date < begin_d THEN
      RETURN 'Upcoming';
   ELSE
      RETURN 'Completed';
   END IF;
END;
$$ LANGUAGE plpgsql;

SELECT research_id, title,
       get_project_status(begin_date, end_date) AS project_status
FROM research
LIMIT 5;

