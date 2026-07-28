# Week 1- Creating Structures


## Slide 1

- Creating data structuresDr Mariana RochaSchool of Computer Science
- CPMU 2007 Databases 1, Lecture 1

## Before we start

- Please scan the QR Code and provide your details (name, student number and email address).

## Learning Objectives

- Review the main concepts covered last week
- Understand the syntax to create table
- Understand the syntax to connect tables
- Familiarise with the key constraints

## What have we learned so far?

- Relational Database
  - A collection of related records called rows (consisting of variables called columns), organized into tables
  - Tables are connected based on common variables
    - Records are related based on having common values for  these common variables
- Database Management System (DBMS)
  - System software that allows us to manage the  content/information stored in a database

## How do we instruct the DBMS?

- SQL (Structured Query Language)
- Includes:
  - Data Manipulation Language (DML)
  - Data Definition Language (DDL)
- Before we can manipulate data, we need to
  - Define the data structure
  - Populate the data adhering to the constraints (outlined in the meta-data)

## How do we instruct the DBMS?

- SQL is case-insensitive – to the DBMS, CREATE or create means the same
- However, there is a need to work on some convention in case other developers need to read your code
- To practice that, we will write SQL keywords in uppercase letters, data type in uppercase letters, and table names and properties in lowercase letters.

## DDL and DML main commands


## Tables

- Fundamental structure in the relational model
- Organised collection of symbols
- Organised into rows and columns

## Creating a table

- A table is an object that can store data in a database.
- You will create a table for each ‘thing’ you want to store data about.
- When you create a table, you must specify:
  - the table name,
  - the name of each column,
  - the data type of each column,
  - the size of each column
  - any constraints on the data that each column can contain

## Creating a table - process

- Sometimes, we want to create a table that already exists
- If you are sure you do not need a table with that name, use the DROP TABLE DDL statement before creating the new table
- In Postgres, it is good practice to use DROP TABLE IF EXISTS. This statement will check if the table exists before trying to drop it.
- It is good practice to drop tables in the opposite order they were created
- Do not forget to comment on your code to make it clearer. Double dash (--) is used for single-line comments, while /* */is used to enclose multi-line comments.

## Creating a table - example

- Suppose we want to model a very basic version of IMDb (Internet Movie Database)

## Creating a table - example

- We want to store data about movies and actors
- We need TWO basic tables: movies and actors
- Let’s work on it together. Open DBeaver on your laptop or use the https://onecompiler.com/postgresql website to create the tables. Consider:
  - What commands will you use?
  - What columns will you include?
  - Which of these columns will be the unique identifier?
  - What types of data will you insert?

## Creating a table - example

- What piece of data is unique?
- movieId, movieTitle, releaseYear, Director, Budget,  Profit
- actorId, actorName
- Movies
- Actors

## Metadata - Datatypes in PostgreSQL


## Creating a table - example

- Movies
- Actors
- CREATE TABLE movies (movieId SERIAL PRIMARY KEY, movieTitle VARCHAR(50), releaseYear INT, director VARCHAR(30), budget INT, profit INT);
- CREATE TABLE actors (actorId SERIAL PRIMARY KEY, actorName VARCHAR(30));

## Naming tables

- The table name
  - Call your table a name that is short and sensible.
  - Reflect the names in your design.
- Table names and column names:
  - Must begin with a letter
  - Must be 1–30 characters long
  - Must contain characters between A–Z, a–z, 0–9, _, $,  and # (no spaces of hyphens (-) or quotation marks)
  - Must not duplicate the name of another object owned  by the same user
  - Must not be a PostgreSQL server reserved word

## Key constraints – Primary Key

- Column or a set of columns that uniquely identify  a specific instance of the thing a table represents
- Every entity in the data model must have a primary key whose values uniquely identify instances of the entity.
- The primary key enforces entity integrity by uniquely identifying entity instances.

## Key constraints – Primary Key

- Entity
- Attribute

## Key constraints – Primary Key

- To qualify as a primary key, a column must have the following properties:
  - it must have a non-null value for each instance of the entity
  - the value must be unique for each instance of an entity
  - the values must not change or become null during the  life of each entity instance
  - Can you think of a real-life example?

## Key constraints – Primary Key

- Let's assume that for each employee in an organisation, there are three candidate keys:
  - Employee ID, PPS Number, and Name.
  - Which one we should pick as the primary key?

## Defining a primary key – Column level

- CREATE TABLE Actor(
- actorID SERIAL PRIMARY KEY,
- actorName VARCHAR(30)
- );
- The primary key can be defined at a column level, inserting the keywords PRIMARY KEY in line with the chosen column.

## Defining a primary key – table level

- CREATE TABLE Actor(
- actorID SERIAL,
- actorName VARCHAR(30),
- PRIMARY KEY (actorID)
- );
- The primary key can also be defined at the table level, adding the information to the end of the SQL DDL query.

## Defining a primary key – naming PK

- CREATE TABLE Actor(
- actorID SERIAL,
- actorName VARCHAR(30),
- CONSTRAINT actors_pk PRIMARY KEY (actorID)
- );
- It is also possible to give a name to the primary key constraint. This action facilitates maintenance and allows informative error messages.

## IMDb Example

- We have now created data structures
  - Two basic tables
- Each table represents one thing we want to store data  about (Movie and Actor)
- Each table has a set of columns which define the type of  data we want to store about the thing the table represents
- Each table has a primary key defined through which we  can retrieve specific rows of data
- However, we do not have a mechanism to store data about  a movie cast, i.e. the actors who appeared in a movie

## IMDb example

- Title: Jumanji: Welcome to the Jungle
- Year: 2017
- Director: Jake Kasdan
- Budget: 90 million
- Profit: 962,077,546
- Dwayne Johnson is part of the cast

## IMDb example

- What else has Dwayne Johnson appeared in?

## IMDb Example – movieCast

- Suppose we include the actorID and name of the character played on the Movies table
- Our primary key is now incorrect
- We would have multiple rows of data for each movie
  - One for every actor who appeared in the movie
  - We would be storing the movieId, movie title, year, director, budget and profit on each row
  - This is wasteful and, if we need to change something, we have to change it all

## IMDb Example – movieCast

- The resulting table is redundant.

## IMDb example – movieCast

- Possible solution: introduce the table Cast
- It has the attributes movieId, actorId and role name
- What should our primary key be?
- CREATE TABLE cast(
- movieID SERIAL,
- actorID SERIAL,
- rolePlayed VARCHAR(50)
- );

## Compound primary key

- Suppose we decide that the combination of movieID and actorID is  unique
- We need a Compound Primary Key
- Remember: Compound primary keys can only be created at the table level
- CREATE TABLE movieCast(
- movieID SERIAL,
- actorID SERIAL,
- rolePlayed VARCHAR(50),
- PRIMARY KEY (movieID, actorID)
- );

## IMDb structure

- Three tables:
- movieCast has a common data element with movies (movieId)
- movieCast has a common data element with actors (actorId)
- We must ensure this is expressed in the metadata to protect our data’s integrity.
- movies
- actors
- movieCast

## Defining table relationships

- Foreign keys define relationships between tables
- A foreign key is a constraint that establishes a link between two tables by ensuring that the values in one table's column(s) match the values in another table's primary key column(s). That happens when a column of one table is the same as the primary key of another
- So we need to include something in our CREATE statement for movieCast to indicate which attribute is  the foreign key

## Foreign Keys

- We know that Cast has two foreign keys: actorID  and movieID

## Defining foreign keys

- To define a foreign key between two tables, we declare the foreign key at a table level (after declaring the columns) and state from which table we are retrieving the data.
- FOREIGN KEY: Defines the column in the child table at the table-constraint level
- REFERENCES: Identifies the table and column in the parent table
- CREATE TABLE movieCast(
- movieID SERIAL,
- actorID SERIAL,
- rolePlayed VARCHAR(50),
- CONSTRAINT cast_actor_fk  FOREIGN KEY (actorId) REFERENCES actors (actorID),
- CONSTRAINT cast_movie_fk  FOREIGN KEY (movieId) REFERENCES movies (movieID),
- PRIMARY KEY (movieID, actorID));

## Defining tables relationships


## Foreign keys

- Foreign keys provide a method for maintaining integrity in the data (called referential integrity) and navigating between different instances of an entity.
- Every relationship between tables must be supported by a foreign key.
- Foreign key attributes are indicated by the notation (FK) beside them on database models.

## The order of creation

- We need to create the tables in order
  - Movie
  - Actor
  - Cast
- Why?

## The order of creation

- First
  - Create tables that have no dependencies
- Second
  - Create tables that depend on those tables but only have one  dependency
- Third
  - Create tables with multiple dependencies

## DROP TABLE

- All data and structure in the table are deleted.
- Any pending TRANSACTION is committed.
- All indexes are dropped.
- All constraints are dropped.
- Once the table is dropped, there is no turning back

## DROP TABLE - order

- The order used to drop the table also matters.
- We should drop tables in the opposite order they were created
- If we try to drop a table that contains a column that is a foreign key in another existing table, we get an error
- First, delete tables with multiple dependencies, then tables with no dependencies

## DROP TABLE - order

- When we create a set of SQL in a script to create and insert data, we include statements to drop the tables at the start of that script
- This will make sure our script clears out any old versions of our tables
- If no tables exist, then we will get an error message
- You can also use DROP TABLE IF EXISTS to skip that message
