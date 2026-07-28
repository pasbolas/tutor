# Week 3 - Database integrity and constraints


## Database integrity and constraintsDr Mariana RochaSchool of Computer Science

- CMPU 2007 Databases 1, Lecture 3

## Databases integrity

- So far, we have learned how to build and populate tables considering two main types of constraints: key constraints and data type constraints.
- Today, we will expand on and examine other aspects of relational databases that can help keep our data safe and easy to access.

## Constraints

- Constraints are rules that the data must follow to be included in or excluded from a given entity.
- Ensures that whoever uses your data can be confident that the data will be consistent.

## Databases integrity


## Entity integrity


## Entity integrity

- Entity integrity: Every table must have a primary key, and its values must be unique, not null and cannot change. This ensures each row is identifiable.
- CREATE TABLE clubs (
  - club_id TEXT PRIMARY KEY, -- club id must be unique, not null and cannot change
  - club_name VARCHAR(120) UNIQUE NOT NULL);

## Referential integrity


## Foreign Keys can be NULL sometimes

- In this example, manager_id is a FK coming from the table employees.
- A project can exist without a manager assigned to it, so the record of the manager_id (foreign key) would be null.

## Foreign Key - Syntax

- FOREIGN KEY: Defines the column in the child table at the table- constraint level
- REFERENCES: Identifies the table and column in the	parent table
- Additional things you can add to the constraint:
  - ON DELETE CASCADE: Deletes the dependent rows in the child table when a row in the parent table is deleted
  - ON DELETE SET NULL: Converts dependent foreign key values to null

## Slide 10

- -- Create the Employees table (parent table)
- CREATE TABLE Employees (
- employee_id INT PRIMARY KEY,
- employee_name VARCHAR(100)
- );
- -- Create the Projects table (child table)
- -- We have two options of foreign key constraints:
- -- 1. ON DELETE CASCADE: If an employee is deleted, the associated project will also be deleted.
- -- 2. ON DELETE SET NULL: If an employee is deleted, the manager_id of the associated project will be set to NULL.
- CREATE table Projects (
- project_id INT PRIMARY KEY,
- project_name VARCHAR(100),
- manager_id INT,
- FOREIGN KEY (manager_id) REFERENCES Employees(employee_id) ON DELETE SET NULL
- );

## Cascade and Referential Integrity


## DROP TABLE CASCADE

- CASCADE is an option you can set on foreign keys or DROP TABLE statements. You are telling the system that, if the parent table changes or is deleted, the same applies to the child tables.
- Considering our football database:
- DROP TABLE players CASCADE;
- Will drop the foreign key constraint in the table player_contracts. The values for player_id and club_id in the table persist, but only club_id is still considered a foreign key.

## ON DELETE CASCADE

- If we run:
- The entire row in player_contracts where player_id = 101 will be deleted.
- The foreign key still exists, but the original player is gone, so all contracts for that player should also be gone.
- CREATE TABLE player_contracts (
    - player_contract_id SERIAL PRIMARY KEY,
    - player_id INT REFERENCES players(player_id) ON DELETE CASCADE,
    - club_id TEXT REFERENCES clubs(club_id),
    - joined DATE,
    - contract_valid_until INT,
    - jersey_number INT,
    - wage NUMERIC(12,0)
- );
- DELETE FROM players WHERE player_id = 101;

## ON UPDATE CASCADE

- Suppose we added a club named “FC Barcelona” to the table clubs. If we run:
- The clubs table now has 'BARCA' instead of ‘FC Barcelona'.
- Because of ON UPDATE CASCADE, the matches.home_club_name is automatically updated to 'BARCA'.
- No manual fix is needed.
- CREATE TABLE matches (
- match_id TEXT PRIMARY KEY,
- match_date DATE,
- location TEXT,
- home_club_id TEXT REFERENCES clubs(club_id) ON UPDATE CASCADE,
- away_club_id TEXT REFERENCES clubs(club_id) ON UPDATE CASCADE
- );
- UPDATE clubs SET club_name = 'BARCA’ WHERE club_name = ‘FC Barcelona';

## When to use CASCADE

- ON DELETE CASCADE
    - Use when the child record only makes sense when the parent exists.
    - ON UPDATE CASCADE
    - Use if the parent key values might change and children should follow.

## When not to use CASCADE

- When NOT to use CASCADE:
- Data should be preserved for history
- Considering player_contracts: if a club is deleted, should all contracts vanish? Maybe contracts might need to be preserved for history.
- Auditing/legal reasons.
- You might want to prevent deleting a club if contracts exist → use ON DELETE RESTRICT instead.
- DROP TABLE CASCADE: Useful in development/testing when you want to remove everything quickly. It is, though, dangerous in production — it removes dependent objects automatically, which may not be what you want. Avoid using DROP TABLE CASCADE.

## Domain integrity


## Domain integrity

- Define that values must obey rules for data type, format and acceptable range.
- Includes use of commands such as NOT NULL, UNIQUE, CHECK, LIKE, and DEFAULT..

## NULL and	 NOT NULL

- What is NULL?
  - Null is a non-value
  - It is not zero
  - It is not blank
- NULL is a special name to denote a valueless column in a row.
- If the column must contain a non-null value, the constraint ‘NOT NULL’ should be put on it.
- This will prevent a user from adding a row that has no value for this column. For example, there is no sense in adding a student without a name. There is no sense in adding a stock item without a description.
- The default is NULL
  - Unless you specify NOT NULL, nulls will be allowed.

## NOT NULL

- CREATE TABLE players (
  - player_id INT PRIMARY KEY,
  - player_name TEXT NOT NULL, -- must always have a name
  - age INT,
  - nationality TEXT,
  - preferred_foot TEXT,
  - body_type TEXT,
  - height TEXT,
  - weight TEXT
- );

## DEFAULT

- Provides an automatic value for a column if no value is supplied during an INSERT.
- Suppose when a new contract is created, if no wage is specified, it should default to 0.
- If a wage is specified, its value overrides the 0.
- CREATE TABLE player_contracts (
- player_contract_id SERIAL PRIMARY KEY,
- player_id INT REFERENCES players(player_id),
- club_id TEXT REFERENCES clubs(club_id),
- joined DATE DEFAULT CURRENT_DATE,
- contract_valid_until INT,
- jersey_number INT,
- value NUMERIC(12,0) DEFAULT 0,
- wage INT DEFAULT 0,
- release_clause INT
- );

## UNIQUE

  - This allows the column value to be checked against all other values in that column in the table.
- This constraint can be applied even if the column allows null values.
  - For example, an e-mail address is not necessary, but if it is present, it must be unique: no other member can have the same e-mail address.
- CREATE TABLE clubs (
- club_id TEXT PRIMARY KEY,
- club_name VARCHAR(120) UNIQUE NOT NULL -- club names must be unique
- );

## CHECK

- Defines a condition that each row must satisfy
- This allows the column value to be checked
  - against a range of values
    - E.g. <	value, > value, between n and m, etc.
  - or selection of values.
    - E.g. IN (‘Monday’,’Tuesday’,’Wednesday’)
- A single column can have multiple CHECK constraints that refer to the column in its definition.

## CHECK

- CREATE TABLE players (
- player_id INT PRIMARY KEY,
- player_name TEXT NOT NULL,
- age INT CHECK (age >= 16) CHECK (age > 0) – two checks
- );

## BETWEEN conditions

- Use the BETWEEN condition to restrict values to a particular range
- The BETWEEN operator works like any other comparison (e.g., >, <, =), but it needs to be part of a CHECK constraint for it to have an effect.
- ALTER TABLE players
- ADD CONSTRAINT age_range CHECK (age BETWEEN 16 AND 50);

## IN operator

- Use the IN membership condition to test for values in a list
- CREATE TABLE players (
- player_id INT PRIMARY KEY,
- player_name TEXT NOT NULL,
- age INT CHECK (age BETWEEN 16 AND 50),
- nationality TEXT,
- preferred_foot TEXT CHECK (preferred_foot IN ('Left','Right','Both')));

## LIKE operator

- Use the LIKE condition to pattern match valid string values.
- Conditions can contain either literal characters or numbers:
- % denotes zero or many characters.
- _ denotes one character.
- CREATE TABLE clubs (
- club_id TEXT PRIMARY KEY CHECK (club_id LIKE 'CLB-%'), -- must start with CLB-
- club_name VARCHAR(120) UNIQUE NOT NULL
- );

## User-defined integrity(Business rules)


## User-defined

- They are part of domain constraints, but can be decided based on the business logic, not general logic.
- For example, the club managers could decide that player_contract should have a release_clause, and this column should have values at least twice the wage.
- That prevents players from being bought too cheaply.
- CREATE TABLE player_contracts (
- player_contract_id SERIAL PRIMARY KEY,
- player_id INT NOT NULL,
- club_id TEXT,
- wage INT NOT NULL CHECK (wage >= 0),
- release_clause INT CHECK (release_clause >= 2 * wage)
- );

## Slide 30

