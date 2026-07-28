# Week 5 - Set operations


## Set operationsDr Mariana RochaSchool of Computer Science

- CPMU 2007 Databases 1, Lecture 4

## Slide 2

- We’ve learned how to combine related tables by matching keys. That’s a horizontal combination (results displayed side by side).
- But what if you want to merge or compare results that have the same structure but no connection?
- That’s where SET operations come in, providing a vertical combination, as the resulting output will be tables stacked.
- Combining tables

## Slide 3

- While joins combine rows based on related columns, set operations work on entire result sets, connected or not.
- Joins are used to retrieve related data from multiple tables, whereas set operations are used to manipulate the entire sets of data from queries.
- JOINS x SET operations

## Slide 4

- To run a SET operation between two entities, these entities must have:
  - Same number of columns
  - Compatible data types
- Basic requirements for SET operations

## Slide 5

- UNION: Combines results and removes duplicates
- UNION ALL: Combines results and keeps duplicates
- INTERSECT: Returns common rows
- EXCEPT: Returns rows in the first query not in the second query.
- Overview of SET operations

## Slide 6

- Let’s see some examples considering our football database
- Implementation

## UNION Operator

- A
- B
- The UNION operator returns a union of two select statements

## Syntax

- SELECT column_list FROM table1
- UNION
- SELECT column_list FROM table2;

## Slide 9

- Using the UNION Operator
- Project
- Employees
- Consider the following tables. They have the same column department, but they are not connected.

## Using the UNION Operator

- SELECT department FROM project
- UNION
- SELECT department FROM employee;

## Slide 11

- Using the UNION Operator
- Every SELECT statement within a UNION must have the same number of columns
- Having columns with the same data types across different SELECT statements within a UNION is also mandatory.
- PostgreSQL can convert data types, but not always. Situations where one attribute is numeric and the other is int, for example, are allowed. But text and int won’t work.
- Also, if you want the results to be ordered, you must use ORDER BY. Otherwise, PostgreSQL will display in whatever order is cheaper to the system.

## Slide 12

- Example using the Football schema
- --Check the data types
- SELECT DISTINCT pg_typeof(player_id) FROM players;
- SELECT DISTINCT pg_typeof(club_id) FROM clubs;
- --Will result in an error as data types are different
- SELECT player_id, 'players' --we manually create another column with the name of the table
- FROM players
- UNION
- SELECT club_id, 'clubs'
- FROM clubs;
- --Casting to make it work
- SELECT player_id::text, 'players'
- FROM players
- UNION
- SELECT club_id, 'clubs'
- FROM clubs;

## Slide 13

- Using ORDER BY
- --We can order by the first attribute selected
- SELECT player_id::text, 'players’ “Source table”
- FROM players
- UNION
- SELECT club_id, 'clubs’ “Source table”
- FROM clubs ORDER BY player_id;
- --If we try to order by the second attribute, we get an error as it no longer exists -- it was merged with the first one
- SELECT player_id::text, 'players’ “Source table”
- FROM players
- UNION
- SELECT club_id, 'clubs’ “Source table”
- FROM clubs ORDER BY club_id;
- This example shows that ordering by player_id works, but by club_id doesn’t as club_id was already merged to player_id when we ORDER BY.
- However, we can use ORDER BY 2 instead – no errors and ordinal ordering is more efficient.

## Slide 14

- UNION ALL
- UNION ALL will output data from both tables, including possible duplicates. In the schema we are using, both tables player_attributes and player_contracts have the attributes jersey_number. Let’s check the duplicates:
- SELECT jersey_number, 'player_attributes' "Source table"
- FROM player_attributes
- UNION ALL
- SELECT jersey_number, 'player_contracts' "Source table"
- FROM player_contracts ORDER BY 1;

## Slide 15

- INTERSECT Operator
- A
- B
- The INTERSECT operator returns rows that have common values to both queries.

## Using the INTERSECT Operator

- Every SELECT statement within INTERSECT must have the same number of columns
- The columns should also have the same data types
- The columns in every SELECT statement must also be in the same order

## Using the INTERSECT Operator

- SELECT column_list FROM table1
- INTERSECT
- SELECT column_list FROM table2;

## Using the INTERSECT Operator

- Project
- Employees
- Suppose the employee Patrick Delaney changed to the HR department. Now, the employees table has a department that the project table does not have.

## Using the INTERSECT Operator

- SELECT department FROM project
- INTERSECT
- SELECT department FROM employee;

## Using the INTERSECT Operator

- SELECT player_id
- FROM player_contracts
- INTERSECT ALL
- SELECT player_id
- FROM player_attributes;
- The intersect will show the unique values shared by player_id in both tables.
- In this case, we won’t be able to know the source table as only one value is shown.

## EXCEPT Operator

- A
- B
- The EXCEPT operator returns rows in the first query that are not present in the second query.

## Using the EXCEPT operator

- Every SELECT statement within EXCEPT must have the same number of columns
- The columns must also have the same data types
- The columns in every SELECT statement must also be in the same order

## Slide 23

- Project
- Employees
- If we want to select the department attribute from the table Project MINUS the department attribute from the table Employees, what result would we get?
- Using the EXCEPT operator

## Slide 24

- SELECT department FROM employee
- EXCEPT
- SELECT department FROM project;
- Using the EXCEPT operator

## Slide 25

- Using the EXCEPT operator
- SELECT department FROM employee
- EXCEPT
- SELECT department FROM project;

## Slide 26

- Using the EXCEPT operator
- --EXCEPT: Players that have data on attributes but no contract
- SELECT player_id
- FROM players
- EXCEPT
- SELECT player_id
- FROM player_contracts;
- --We can confirm the number using count in a join
- SELECT COUNT(*)
- FROM players
- LEFT JOIN player_contracts USING (player_id)
- WHERE player_contracts.player_id IS NULL;

## UNION, INTERSECT and EXCEPT

- Treat the tables as sets and are the usual set operators of  union, intersection, and difference
- They all combine the results from two select statements
- The results of the two selects must have the same  columns and data types

## Joins x Set Operations

- In certain scenarios, joins can be more efficient, particularly when working with large datasets.
- Joins offer more customisation in specifying how tables should be combined based on specific criteria.
- Use Joins when you need data from different tables based on their relationships and want a more complex, context-rich result set.
- Use Set Operations when you want to combine results from tables that are not connected.

## Slide 29

