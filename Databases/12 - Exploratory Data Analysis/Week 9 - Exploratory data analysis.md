# Week 9 - Exploratory data analysis


## Exploratory Data AnalysisDr Mariana RochaSchool of Computer Science

- CMPU 2007 Databases 1, Lecture 9

## Learning Objectives

- Understand the concept of Exploratory Data Analysis (EDA)
- Understand the application of SQL to deliver an EDA report

## Exploratory Data Analysis (EDA)

- Exploratory Data Analysis is applied to identify patterns and relationships between different variables on the data, helping us to generate hypotheses for further analysis.
- We will use EDA as a way to review some important SQL concepts for data retrieval.

## EDA Steps

- Step 1: Understand the structure (tables, relationships, metadata).
- Step 2: Preview the data (sample rows, counts).
- Step 3: Data quality checks (missing values, duplicates, inconsistent codes).
- Step 4: Descriptive statistics (distributions, averages, counts).
- Step 5: Relationships (joins between tables, correlations, group comparisons).
- Step 6: Identify anomalies/outliers.

## EDA - Football


## Step 1: Understand the structure (tables, relationships, metadata)

- To perform that step, we can use the information.schema, a set of views that contain information about the objects defined in the current database.
- It acts as a repository for metadata, which is data about the data and its structure within the database.

## Step 1.1: Gather tables names

- The first step is to identify what tables are stored in our schema.
- SELECT table_name
- FROM information_schema.tables
- WHERE table_schema = 'football'
- AND table_type = 'BASE TABLE' --rather than a view
- ORDER BY table_name;

## Step 1.2: Identify columns, data types and nullability

- We will select the attributes table_name, column_name, data_type and is_nullable.
- This should be repeated for each table in the schema.
- We also order by ordinal position, which is the order in which the columns were created.
- SELECT table_name, column_name, data_type, is_nullable
- FROM information_schema.columns
- WHERE table_schema = 'football' AND table_name = 'players'
- ORDER BY ordinal_position;

## Step 1.3: Identify the tables’ constraints

- Allow us to know what constraints were established and how PostgreSQL named them.
- SELECT table_name, constraint_name, constraint_type FROM information_schema.table_constraints WHERE table_schema = 'football';

## Step 2: Preview the data (sample rows, counts)

- Now, we will retrieve data straight from the tables using aggregate formulas and filtering commands (order by, limit, group by etc.).

## Step 2.1: Cross-table coverage

- The command below uses subqueries to count the number of rows in each table for comparison.
- SELECT
- (SELECT COUNT(player_id) FROM players) "Total number of players",
- (SELECT COUNT(club_id) FROM clubs) "Number of clubs",
- (SELECT COUNT(DISTINCT player_id) FROM player_attributes) "Number of players with attributes",
- (SELECT COUNT(DISTINCT player_id) FROM player_contracts) "Number of players with contracts";

## Step 2.2: Preview data – first 10 rows

- We can also take a quick look at the first 10 rows of each table using the command LIMIT 10.
- -- Show the first 10 rows of a table
- SELECT * FROM players LIMIT 10;

## Step 2.3: Preview specific conditions

- Other data preview can be more specific.
- -- Show distinct values of a column
- SELECT DISTINCT nationality
- FROM players;
- -- Random sample of 5 rows
- SELECT * FROM players ORDER BY RANDOM() LIMIT 5;
- -- Preview top players by rating
- SELECT player_id, overall
- FROM player_attributes
- ORDER BY overall DESC
- LIMIT 10;

## Step 2.4: Preview maximum and minimum values

- Part of the preview can also be done considering the maximum and minimum values. This gives us an idea of the range of values available in the database.
- SELECT MIN(joined) "First contract date",
- MAX(joined) "Last contract date",
- MIN(contract_valid_until) "Minimum expiry year",
- MAX(contract_valid_until) "Maximum expiry year"
- FROM player_contracts;

## Step 2.5: How big are the clubs?

- Another interesting measure is to identify how many contracts each club has.
- As we are grouping the contracts according to the club name, we need to use the GROUP BY command.
- SELECT club_name, COUNT(*) "Number of contracts"
- FROM player_contracts
- JOIN clubs USING (club_id)
- GROUP BY club_name
- ORDER BY contracts DESC
- LIMIT 10;

## Step 3: Data quality checks

- We will retrieve data straight from the tables considering specific scenarios such as null data, duplicates and orphan values.

## Step 3.1: Null profiling

- We start by checking how many rows are NULL for a certain attribute. This can be repeated for different tables and different attributes.
- SELECT
- COUNT(*) "Total number of rows",
- COUNT(*) FILTER (WHERE heading_accuracy IS NULL) "Number of rows where heading accuracy is NULL",
- COUNT(*) FILTER (WHERE weight IS NULL) "Number of rows where weight is NULL",
- COUNT(*) FILTER (WHERE overall IS NULL) "Number of rows where overall is NULL"
- FROM player_attributes;

## Step 3.2: Duplicates

- We now want to evaluate if there are duplicates in our data. That’s important as it might require data cleaning before progressing with the analysis.
- For example, we do not expect the same player to have multiple rows in the player_attributes table, so we can try to identify that.
- SELECT player_id, COUNT(*) "Rows per player"
- FROM player_attributes
- GROUP BY player_id
- HAVING COUNT(*) > 1
- ORDER BY rows_per_player DESC;

## Step 3.3: Orphan references

- In a relational database, an orphan value is a child record that refers to a parent that doesn’t exist. This can happen when foreign keys are not enforced or when values are deleted in the parent table.
- For example, we can check if there are any contracts pointing to clubs that no longer exist.
- SELECT pc.player_contract_id, pc.player_id, pc.club_id, pc.joined, pc.contract_valid_until
- FROM player_contracts pc
- LEFT JOIN clubs c
- USING (club_id)
- WHERE c.club_id IS NULL;

## Step 4: Descriptive statistics

- In EDA, we use descriptive statistics to identify measures of central tendency (central values like mean) and measures of variability (such as minimum and maximum values).

## Step 4.1: Summaries

- The summary can include:
  - total number of values for an attribute
  - minimum value
  - average (sum of all values divided by the number of values)

## Step 4.1: Summaries

- SELECT
- COUNT(*) "Total players",
- COUNT(age) "Total players with age value",
- MIN(age) "Minimum value for age",
- MAX(age) "Maximum value for age",
- AVG(age) "Average value for age”
- FROM players;

## Step 4.3: Measure central tendency and spread for financial attributes

- We can combine central tendency and spread values to identify patterns.
- For example, we are looking into minimum and maximum wages, the average wage, and the median wage.
- Compare mean vs median: if mean > median, our data is skewed by a few top earners.
- When we look at the average result, we might think football players make a lot of money – however, this is skewed by the top earners.

## Step 5: Relationahips

- We now start to attempt to understand how variables interact. We might also use JOINs to check the interaction between different tables.

## Step 5.1: Overview of main attributes of all tables

- This creates a single analytical view of each player: who they are, how good they are, where they play, and how much they earn.
- SELECT
- player_name,
- overall,
- potential,
- wage,
- club_name
- FROM players
- JOIN player_attributes USING (player_id)
- JOIN player_contracts USING (player_id)
- JOIN clubs USING (club_id);

## Step 5.2: Club spend vs average rating

- We can run two joins to evaluate if the money spent by a club is in line with the overall rating.
- SELECT club_name "Club",
- COUNT(*) "Number of players",
- SUM(wage) "Spent on wage",
- AVG(overall) "Overall rate"
- FROM player_contracts
- JOIN clubs USING (club_id)
- LEFT JOIN player_attributes USING (player_id)
- GROUP BY club_name
- ORDER BY 3 DESC NULLS LAST;

## Step 5.3: Players registered but without a contract

- We can check if a player is registered on the database but has no contract (missing links between tables player_attributes and player_contracts).
- SELECT p.player_id, p.player_name, pc.player_contract_id
- FROM players p
- JOIN player_attributes pa USING (player_id)
- LEFT JOIN player_contracts pc USING (player_id)
- WHERE pc.player_id IS NULL
- ORDER BY p.player_name;

## Step 6: Anomalies and outliers

- Finally, we will check if there is any weird pattern or data out of place.

## Step 6.1: Joined date after expiring date

- We want to check if the joining year (joined) is greater than the expiring year of the contract (contract_valid_until).
- Notice that joined is a date data type and contract_valid_until is an integer. We need to extract the year from the attribute joined.
- SELECT player_id, joined, contract_valid_until
- FROM player_contracts
- WHERE contract_valid_until IS NOT NULL
- AND joined IS NOT NULL
- --joined is a date data type, we need to extract the year
- AND EXTRACT(YEAR FROM joined) > contract_valid_until;

## Step 6.2: Unrealistic ages

- In the case of our database, we do not expect to find players younger than 14 years old and older than 50 years old.
- We can try to catch those outliers.
- SELECT player_id, player_name, age
- FROM players
- WHERE age < 14 OR age > 50;

## Step 6.3: Wage outliers

- We can try to identify which players make more money than average and how much more they make.
- SELECT
- p.player_name,
- c.club_name,
- pc.wage,
- pa.overall,
- --we use a subquery because avg() expects a group by at the end
- ROUND(pc.wage / (SELECT AVG(wage) FROM player_contracts WHERE wage IS NOT NULL), 2) "Times above the average"
- FROM player_contracts pc
- JOIN players p USING (player_id)
- LEFT JOIN player_attributes pa USING (player_id)
- LEFT JOIN clubs c USING (club_id)
- WHERE pc.wage IS NOT NULL
- ORDER BY pc.wage DESC LIMIT 10;
