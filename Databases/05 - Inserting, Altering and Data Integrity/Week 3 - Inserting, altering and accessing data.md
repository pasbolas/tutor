# Week 3 - Inserting, altering and accessing data


## Slide 1

- Inserting dataDr Mariana RochaSchool of Computer Science
- CPMU 2007 Databases 1, Lecture 2

## Learning Objectives

- Understand how to populate a table
- Understand how to modify the structure of a table
- Familiarise with how to access and display data from a table

## Inserting data


## Inserting data - what to consider?

- The format of the table, considering the columns and their constraints. Make sure VARCHAR, TEXT, DATE and TIMESTAMP fields have their values surrounded by single quotes when inserted.
- You can do either:
  - A full INSERT
    - This inserts a value for every column in the table.
  - A partial INSERT
    - This inserts some values but accepts the default values for other columns.

## Adding a new row

- INSERT INTO table (column1, column2, ... column_n ) VALUES  (expression1, expression2, ... expression_n );
- INSERT INTO users VALUES (001, 'John', 'Smith');

## Adding a new row without column specification

- If we do not include a column list, the DBMS assumes you are inserting data in the column order it expects. That is useful if you know the order and you are filling out all the attributes.
- If userId was SERIAL data type, we would need to list the columns before inserting data, so we can skip the serial type column.
- INSERT INTO users VALUES (001, 'John', 'Smith');
- INSERT INTO users (userId, userName, userSurname) VALUES (001, 'John', 'Smith');

## Possible errors – constraint violation

- This is the code to create the table users:
- Suppose we run the following code twice:
- We will get the following error on Dbeaver:
- What does it mean?
- INSERT INTO users VALUES (001, 'John', 'Smith’);
- INSERT INTO users VALUES (001, 'John', 'Smith');
- CREATE TABLE users (userId INT PRIMARY KEY, userName VARCHAR(30), userSurname VARCHAR(30));

## Possible errors – constraint violation

- We’ve already inserted a row with a userId = 001.
- If we try to insert a second row with a userId with the value 001:
  - We are trying to add a duplicate primary key (not allowed)
- Action: Either remove the unique restriction or do not insert the key

## Possible errors – connected tables

- Let’s go back to the database we created to store information about movies, actors and movie cast:
- CREATE TABLE movies (movieId SERIAL PRIMARY KEY, movieTitle VARCHAR(50), releaseYear INT, director VARCHAR(30), budget INT, profit INT);
- CREATE TABLE actors(actorID SERIAL, actorName VARCHAR(30),CONSTRAINT actors_pk PRIMARY KEY (actorID));
- CREATE TABLE movie_cast(movieID SERIAL, actorID SERIAL, rolePlayed VARCHAR(50),CONSTRAINT cast_actor_fk FOREIGN KEY (actorId) REFERENCES actors (actorID), CONSTRAINT cast_movie_fk FOREIGN KEY (movieId) REFERENCES movies (movieID), PRIMARY KEY (movieID, actorID));

## The order of insertion follows the order of creation

- Always follow the order used to create the tables. For example, if we try to insert into the table movieCast before inserting into the table movies and actors, we get the following error:
- That’s because there is no movieId = 1 or actorId = 1 inserted yet, so table movieCast cannot populated using that foreign key.
- The order of inserting data should be into the table movies, then table actors, then table movieCast.
- INSERT INTO movie_cast (movieId, actorId, rolePlayed) VALUES (1, 1, ‘Jack Dawson’);

## Insert the correct number of values

- Suppose we run the following statement:
- We get the following error. Why?
- INSERT INTO movies (movieTitle, releaseYear, director, budget) VALUES ('Jumanji: Welcome to the  Jungle', 2017, 'Jake Kasden’);

## Insert the correct number of values

- Suppose we run the following statement:
- We get the following error. Why?
- We need to provide a value for every column the DBMS is expecting a value for.
- There is an equivalent error: Too many values, which happens when we try to insert more values than the DBMS is expecting.
- INSERT INTO movies (movieTitle, releaseYear, director, budget) VALUES ('Jumanji: Welcome to the  Jungle', 2017, 'Jake Kasden’);

## Altering the table


## Alter table

- Once tables are created, they can be modified using the ALTER TABLE statement to:
  - Add a new column
  - Modify an existing column
  - Define a default value for the new column
  - Drop a column
  - Add or drop a constraint

## Alter table - syntax

- ALTER TABLE tableName
- [ADD | DROP | ALTER | RENAME] ... ;

## Alter table – Adding columns

- For example, we can add a column genre to our table movies.
- We just need to use the ALTER TABLE command:
- CREATE TABLE movies (movieId SERIAL PRIMARY KEY, movieTitle VARCHAR(50), releaseYear INT, director VARCHAR(30), budget INT, profit INT);
- ALTER TABLE movies ADD COLUMN genre VARCHAR(20);

## Alter table – Modifying a column

- We can also change a column, modifying its data type:
- Or renaming it:
- ALTER TABLE movies
- ALTER COLUMN director TYPE TEXT;
- ALTER TABLE actors
- RENAME COLUMN actorName TO fullName;

## Alter table - Dropping columns

- ALTER TABLE Movie DROP COLUMN director;
- To drop or remove a column in an existing table:
- ALTER TABLE table_name  DROP COLUMN column_name;
- For example:

## Updating existing records

- UPDATE tablename
- SET field1= new_value1, field2 =  new_value2 WHERE search condition;
- The keyword UPDATE can update field values in one or more records in a table. However, only one table may be updated at a time. Check the syntax below.

## Updating existing records

- All rows where the condition is true have the columns set to the given values
- If no condition is given, all rows are changed, so BE CAREFUL
- UPDATE movies
- SET genre = ‘Science fiction'
- WHERE movieTitle = ‘Inception';
- UPDATE movies
- SET genre = ‘Action'
- WHERE movieTitle = ‘The dark knight';

## Accessing data

- Where is the data in the database?
- What is the database structure?
- How is each row identified uniquely?
- What items of data do you need?
- You need to know the constraints. For example:
  - ‘I only want the items purchased in the last month.’
  - ‘I only want to bill for items not paid for.’

## Select statement

- This is the most powerful and complex of SQL statements. The structure is simple:
- There are other rules that can be added later.
- SELECT columns
- FROM table WHERE condition;

## Select everything

- To select all rows and columns from a table called movies, we can run the following statement:
- The * denotes all available columns.
- SELECT * FROM movies;

## Select specific data - Projection

- Let’s select only the column called movieTitle from the table movies. By picking one single column, we have taken a projection from the table.
- SELECT movieTitle FROM movies;

## The WHERE clause

- As we have seen in other statements, the WHERE clause is related to a condition. For data selection, we use the WHERE clause to retrieve data matching some criteria.
- SELECT * FROM movies WHERE genre = ‘Drama’;

## Basic operations to build expressions


## Examples

- --Find the title and budget of all movies with a Movie ID <3?
- SELECT movietitle, budget, director FROM movies WHERE movieid <5;
- --And directed by Christopher Nolan?
- SELECT movietitle, budget, director FROM movies WHERE movieid < 5 AND director ='Christopher Nolan';
- --What happens if we change the AND to OR?
- SELECT movietitle, budget, director FROM movies WHERE movieid <5 OR director='Christopher Nolan';
- --Find the title and budgets of movies not directed by directorid 2?
- SELECT movietitle, budget, director FROM movies WHERE director <> 'Christopher Nolan';

## Between

- --Find the titles of all movies with a budget between 100 and 900
- SELECT movietitle FROM movies WHERE budget BETWEEN 100 and 900;

## In


## Slide 30

- SELECT * FROM Customers
- WHERE Country IN ('Germany', 'France', 'UK’);

## Slide 31

- SELECT * FROM Customers
- WHERE Country NOT IN ('Germany', 'France', 'UK’);

## Like


## Like


## Like

- --Find the names of all movies starting with B?
- SELECT movietitle FROM movies WHERE movietitle LIKE 'B%';
- --Find the names of all movies with a letter a somewhere in their name?
- SELECT movietitle FROM movies WHERE movietitle LIKE '%a%';
- --And does not start with a J
- SELECT movietitle FROM movies WHERE movietitle LIKE '%a%' AND movietitle NOT LIKE 'J%';
- --Movie that starts with The
- SELECT movieTitle, releaseYear, director FROM movies WHERE movieTitle LIKE 'The%';

## Changing output

- Once we run the SELECT statement, the output will use the attribute names decided during the DDL implementation. You can change it so the user can better view the selected data.
- SELECT movieTitle "Title", director "Director" FROM movies WHERE movieId BETWEEN 1 AND 3;

## Naming the techniques we have used

- Projection – filtering out unwanted columns.
- Restriction – filtering out unwanted rows using conditions
- Renaming – using alternate titles
