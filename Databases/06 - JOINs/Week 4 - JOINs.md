# Week 4 - JOINs


## JOINsDr Mariana RochaSchool of Computer Science

- CMPU 2007 Databases 1, Lecture 4

## Learning Objectives

- Learn how to import data from CSV files
- Understand how to explore multiple tables using JOINS

## Importing a CSV file

- So far, we have been inserting data manually through the INSERT INTO command
- We can also import existing data from a CSV file
- Let’s create a database about football players and the clubs they play for.
- The idea was to import the data from existing csv files and use SQL to retrieve data from these tables.

## Create the database

- First, we will create a schema called football. Once this is done, we right-click on the schema -> SQL Editor -> New SQL Script
- Copy and paste the code presented in the file football.sql

## Import the data

- Once all tables are created, we can see them on the football schema (left menu in Dbeaver)
- We should now right-click each table -> Import data
- Select the csv file related to each table

## Slide 6

- This database was created on Dbeaver and stores data imported from CSV datasets.

## JOINS


## JOINs

- So far, in our queries, we have been looking at one table at a time.
- But what if we want to get data from two tables in a single query?
- In SQL, you often need to write queries that get data from two or more tables.
- This is possible because the tables are connected through foreign keys.

## Joins

- A join is a query that combines data from two tables at once, linked together by a common value (foreign key).
- The JOIN illustrates one of the major benefits of using a relational database.
- It combines rows from two or more tables based on the related column they have

## Joins

- There are different types of joins, and they can be used depending on what data you want to retrieve.

## INNER JOIN

- This statement returns rows from both tables where matching values are found.
- This type of join tells the DBMS you want to see all records in table1 and table2 where there is a record in both tables (matching records).
- This makes sense for us because, due to the foreign key, we can trust the integrity of the data.
- Inner Join syntax compares rows of table1 with table2 to check if anything matches based on the condition provided in the ON clause.

## INNER JOIN - SYNTAX

- The syntax is simple: the INNER JOIN is part of a select statement and includes the word JOIN and an ON (or USING) clause to determine what data the two tables have in common
- As the INNER JOIN retrieves only the data the two tables have in common, the order of tables in the FROM…JOIN part does not matter
- SELECT column_name(s) FROM table1 JOIN table2 ON table1.column_name = table2.column_name;

## INNER JOIN – SYNTAX – Table Order

- The order of the tables in an INNER JOIN does not affect which rows are returned because the INNER JOIN only returns rows that satisfy the join condition (the matching records)
- PostgreSQL's optimiser is generally smart enough to reorder the joins internally to maximise performance, so in most cases, you don't need to worry about the order of the tables for performance reasons.
- Be mindful about the order if you are using a different DBMS!

## Slide 14

- If we want to get data on the players (name, nationality, age) and their attributes (potential, weak foot), we need to use a JOIN, as this data is in two different tables. However, I only want data that is shared by both tables – if I have no info on a specific player, that player’s name, nationality and age won’t be retrieved).

## Slide 15

- If we want to get data on the players (name, nationality, age) and their attributes (potential, weak foot), we need to use a JOIN, as this data is in two different tables. However, I only want data that is shared by both tables – if I have no info on a specific player, that player’s name, nationality and age won’t be retrieved).
- -- Data on players with their attributes.
- SELECT player_name,
    - nationality,
    - age,
    - potential,
    - weak_foot
- FROM players
- JOIN player_attributes
- USING (player_id);

## INNER JOIN – SYNTAX – ON clause

- In the previous example, we demonstrated the connection between the tables through the command USING, followed by the attribute that is available in both tables (player_id).
- Another way to do it is through the ON clause. This is commonly used when the common data is allocated in attributes with different names.
- -- Data on players with their attributes.
- SELECT player_name, nationality, age, potential, weak_foot
- FROM players
- JOIN player_attributes
- ON players.player_id = player_attributes.player_id

## INNER JOIN – more than 2 tables

- Suppose we need to retrieve data on player name, club name, wage, and overall rating. These attributes are located in 4 different tables.

## INNER JOIN – more than 2 tables

- Notice that we are performing a join between clubs and player_attributes, even though they are not directly connected. This is called a chained join and it happens when two tables don’t share a direct relationship, but you can connect them by “walking” through one or more intermediate tables.
- SELECT
- player_name, club_name, wage, overall
- FROM players p
- JOIN player_contracts pc
- USING (player_id)
- JOIN clubs c
- USING (club_id)
- JOIN player_attributes pa
- USING (player_id)
- ORDER BY pa.overall DESC;

## INNER JOIN – Adding condition

- We can also use the WHERE keyword to establish a certain condition. Let’s filter with WHERE to get only players earning more than 100k.:
- SELECT
- player_name,
- wage
- FROM players
- JOIN player_contracts
- USING (player_id)
- WHERE wage > 100000;

## INNER JOIN – Combining conditions

- We can also combine the WHERE and ORDER BY conditions to retrieve data in a certain order:
- SELECT
- player_name,
- wage
- FROM players
- JOIN player_contracts
- USING (player_id)
- WHERE wage > 100000
- ORDER BY wage DESC;

## INNER JOIN – Combining conditions

- We can also combine the WHERE and LIKE conditions to retrieve specific data:
- SELECT
- player_name,
- club_name
- FROM players
- JOIN player_contracts
- USING (player_id)
- JOIN clubs
- USING (club_id)
- WHERE player_name LIKE 'Crist%';

## LEFT JOIN

- The LEFT JOIN will always return all records from the left table, even when no matches are in the right table.
- For records with no matching values in the right table, the output contains NULL values.

## LEFT JOIN

- 1,553 players in our database have no contract. I can see that doing a left join between players and players_ contracts.
- SELECT count(player_id) FROM players LEFT JOIN player_contracts USING(player_id) WHERE wage IS NULL;

## LEFT JOIN

- SELECT
- player_id,
- player_name,
- wage
- FROM players
- LEFT JOIN player_contracts
- USING (player_id) ORDER BY wage DESC;

## Slide 25

- The RIGHT JOIN will always return all records from the right table, even when there are no matches in the left table.
- For records with no matching values in the left table, the output contains NULL values.
- RIGHT JOIN

## RIGHT JOIN

- 441 players in our database have no info on the table player_attributes.
- SELECT count(player_id) FROM player_attributes RIGHT JOIN players USING(player_id) WHERE weak_foot IS NULL;

## RIGHT JOIN

- SELECT player_id, player_name, weak_foot
- FROM player_attributes
- RIGHT JOIN players
- USING (player_id)
- ORDER BY weak_foot DESC;

## Slide 28

