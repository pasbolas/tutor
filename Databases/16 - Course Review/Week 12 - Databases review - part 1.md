# Week 12 - Databases review - part 1


## Module review – part 1Dr Mariana RochaSchool of Computer Science

- CMPU 2007 Databases 1, Lecture 12

## Databases

  - A database is a shared persistent collection of logically related  data, supporting several different applications within an  organisation.
  - Shared: used simultaneously by many applications and users
  - Persistent: permanently stored
  - The data stored is all related in some way

## Relational Database

  - A relational database  is a collection of relations or two-dimensional tables.
  - Some advantages:
    - Flexible
    - Promote data integrity
    - Tables are related via a common data item, allowing access considering user needs
    - Easy to use – Simple to add to, delete and modify

## Issues to bear in mind

- Keep the integrity of the database:
  - Entity integrity: primary keys
  - Referential integrity: foreign keys
  - Domain integrity: datatypes and value constraints
- Avoid Redundancy:
  - The same piece of data should not be stored in more than one  location unless it is there to achieve referential integrity

## Entity Relationship Model

- A representation of the data for an  organisation, business area or process

## The Entity-Relationship model

- Expressed in terms of:
  - Entities involved (things about which data is to be stored)
  - Relationships (or associations) among those  entities and
  - Attributes (properties) of  both the entities and their  relationships

## Winter exam – 2023/2024


## Winter exam – 2023/2024

- Considering the Entity Relationship diagram (ERD) for the case study, clearly explain the following concepts, offering an example of each:
  - Entity
  - Attribute
  - Relationship
  - Primary Key
  - Foreign Key

## Slide 9

- Entity: an entity can be a single thing, person, place, or object. The data about these entities are stored in the database. An example of an entity is the table Actor.
- Attribute: an attribute is a property that describes an entity. An example of an attribute is the ReleaseYear.
- Relationship: A relationship is the connection between two tables when one table uses a foreign key that references a primary key of another table. An example is the relationship between the tables Review and Movie through the attribute MovieID.
- Primary Key: A primary key is an attribute or set of attributes in a table whose values uniquely identify a row in the table. It must be unique, not null and it cannot change. An example of a primary key would be the GenreID attribute in the table Genre.
- Foreign Key: A foreign key is an attribute or a set of attributes in a table whose values correspond to the values of the primary key in another table. An example of a foreign key is the ActorID attribute in the table MovieActor.

## Relationships

- A relationship is an association between two entities which is meaningful for the organisation
- A relationship is a natural business association that exists between one or more entities
- Relationships usually arise because of
  - association - a Customer ‘places’ an Order
  - structure - an Order ‘consists’ of Order-Lines
- All relationships that are usable only involve two entities

## Slide 11

- One department has multiple instructors. But instructor belongs to only one department.
  - Hence the cardinality between department and instructor is One to Many (1:N)
- One:Many

## Many:Many

- Often with many to many relationships there is 	data associated with the relationship that cannot be
- attached sensibly to either entity.
- Attaching data to one or other entity results in repeating  data (redundancy)

## Resolving Many:Many

- Introduce a Weak Entity
- The primary key of a weak entity is always the  combination of the primary keys of the entities in the  relationship it is resolving
- Why is it weak?
  - It cannot exist independently of its parent tables
  - Logically/Conceptually it has no purpose
    - It only exists to facilitate the physical relational model

## Identifying vs Non-Identifying Relationship

- Identifying: if the foreign key is part of the primary key it is identifying, and the relationship between the two entities is an identifying relationship
- Non-identifying: if the foreign key is not part of the primary key it is non-identifying and the relationship between the two entities is a non-identifying relationship

## Winter exam – 2017/2018


## Winter exam – 2017/2018

- For each of the following concepts provide a clear explanation of the concept and identify an example of it from the diagram above:
- Entity
- Attribute
- Primary Key
- Foreign Key
- Identifying Relationship

## Winter exam – 2017/2018 - answer


## Winter exam – 2023/2024 - answer

- Using the given ERD for the Movies database as a reference, propose and describe a new entity, its attributes, and its relationships with existing entities. Make it relevant to a movie database scenario.

## Winter exam – 2023/2024 - answer

- Entity Name: Awards
- Attributes:
  - AwardID (Primary Key)
  - MovieID (Foreign Key)
  - ActorID (Foreign Key)
  - AwardName
  - Category
  - Year
- Relationships:
- Each movie can have multiple awards (One-to-Many with Movie).
- Each actor can have multiple awards (One-to-Many with Actor).
- Description:
- The "Awards" entity tracks awards received by movies and actors. It includes details like award name, category, and year. This entity enriches the movie database by showcasing recognition and achievements.

## What if you were asked to provide the code?


## Semester 2 exam – 2024/2025 – TU857

- Propose a new entity for the FitLife database and provide the SQL code to create the entity with its attributes, data types, and other constraints.
- Sample solution:
- CREATE TABLE Achievement (
- AchievementID SERIAL PRIMARY KEY,
- UserID INT NOT NULL,
- AchievementName VARCHAR(100) NOT NULL,
- DateEarned DATE,
- FOREIGN KEY (UserID) REFERENCES UserProfile(UserID)
- );

## Normalisation

- A formal process involves reflecting on tables, attributes, and relationships to be created when developing a database most efficiently.
- The objective of normalisation is to create relations where every dependency is on the key, the whole key, and nothing but the key.
- Normalisation reduces data redundancy and increases data integrity, making it easier to save space on the server and maintain and access the data

## Semester 2 exam – 2024/2025 – TU857

- (a) Considering the process of database normalisation:
- •	What are the primary objectives of normalisation?
- •	Describe the three main normal forms
- Sample solution:
- Database normalisation is a process that structures relational databases to minimise redundancy and enhance data integrity. The first three normal forms (1NF, 2NF, and 3NF) are fundamental in this process:
- o	First Normal Form (1NF): Requires that data is stored in tables with rows and columns, ensuring each column contains atomic values (indivisible). It eliminates repeating groups and allows for unique primary keys.
- o	Second Normal Form (2NF): Building on 1NF eliminates partial dependencies by ensuring that non-key attributes depend on the entire primary key. This is achieved by breaking data into separate related tables.
- o	Third Normal Form (3NF): Further refines the structure by removing transitive dependencies, ensuring that non-key attributes are not dependent on other non-key attributes. This typically results in smaller, more manageable tables.

## ALTER TABLE Statement

- Use the ALTER TABLE statement to:
  - Add a new column
  - Modify an existing column
  - Define a default value for the new column
  - Drop a column
  - Add a constraint
  - Drop a constraint

## Adding column(s) to a table

- To add a column to an existing table:
- ALTER TABLE table_name
- ADD COLUMN column_name datatype column_constraint;
- To add multiple columns to an existing table:
- ALTER TABLE table_name
- ADD COLUMN column_name1 data_type constraint,
- ADD COLUMN column_name2 data_type constraint,
- ...
- ADD COLUMN column_namen data_type constraint;

## Drop column(s)/Rename column(s) in a  table

- To remove a column in an existing table:
- ALTER TABLE table_name
- DROP COLUMN column_name;
- To rename a column in an existing table:
- ALTER TABLE table_name
- RENAME COLUMN column_name
- TO new_column_name;

## Altering to add constraints

- ALTER TABLE table_name
- ADD CHECK expression;
- ALTER TABLE links
- ADD CONSTRAINT unique_url UNIQUE ( url );

## Winter exam – 2022/2023

- Suppose the game, platform and genre tables have been created in an Oracle database with the attributes and datatypes identified in the model given in question 1, part (a). Write the SQL needed to add the following value constraints to the tables using the ALTER statements:
- •	The first character of the game_id must be one of the following: P, L, D, A;
- •	Publishers’ email addresses must include both the @ symbol and the . symbol;
- •	The last digit of a platform_id must be between 1 and 6;
- •	The first character of genre_id must be between A and Z;
- •	The genre_name must be one of the following values: adventure, RPG, simulation, puzzle.

## Winter exam – 2022/2023


## Winter exam – 2022/2023

- Sample solution:
- ALTER TABLE GAME ADD CONSTRAINT CHK_GAMEID CHECK (SUBSTR(GAMEID,1,1)  IN ('P','L','D','A'));
- ALTER TABLE PUBLISHER ADD CONSTRAINT CHK_PUBL_EMAIL CHECK (EMAIL LIKE '%@%' AND EMAIL LIKE '%.%');
- ALTER TABLE PLATFORM ADD CONSTRAINT CHK_PLATID CHECK (SUBSTR(platform_id, -1, 1) BETWEEN 1 AND 6));
- ALTER TABLE GENRE_ID ADD CONSTRAINT CHK_GENREID CHECK (SUBSTR(GENRE_ID,1,1) BETWEEN 'A' AND 'Z');
- ALTER TABLE GENRE ADD CONSTRAINT CHK_GENRENAME CHECK (GENRE_NAME  IN ('ADVENTURE','RPG','SIMULATION','PUZZLE'));

## Identifying errors in the queries


## Winter exam – 2022/2023

- The following SQL queries were written as an attempt to insert data into the video game database. However, each query returned an error. Identify and explain the errors in the queries below:
- INSERT INTO game_publisher VALUES ('Pewter Games', 'pewter@email.com');
- INSERT INTO game VALUES ('1453', 5555, Super Mario, 1234);
- INSERT INTO platform (platform_id, platform_name, developer_name) VALUES (4321, 'Xbox’, ‘Brain Games Studio', 'Mabel Addis');

## Winter exam – 2022/2023


## Winter exam – 2022/2023 - answer

- The first SQL statement attempts to do a partial insertion without listing the attributes, which results in a “not enough values” error.
- The second SQL statement attempts to insert a string value without single quotes, which results in an error.
- The third SQL statement attempts to insert more values than attributes available, resulting in the error “too many values”.

## SQL functions

- SQL functions are built-in operations that take one or more values and return a result.
- They are widely used for data transformation, formatting, calculations, and aggregation.

## Single-row functions

- Process one row at a time
- Return one result per row
- Can be used in SELECT, WHERE, ORDER BY
- Do not change the number of rows returned
- Examples:
- String functions: UPPER(name), LOWER(email), LENGTH(title)
- Number functions: ROUND(salary,2), ABS(value)
- Date functions: TO_CHAR(date, 'DD/MM/YYYY’)
- Conversion functions: TO_NUMBER, TO_CHAR, CAST

## Multiple-row functions (also called aggregate or group functions)

- Operate on multiple rows at once
- Return one result per group
- Used with GROUP BY
- Ignore NULL values (except COUNT(*))
- Examples:
  - COUNT(*): counts rows
  - COUNT(column): counts non-NULL values
  - SUM(amount)
  - AVG(score)
  - MAX(price) / MIN(price)

## Winter exam – 2024/2025 – TU857

- Write an SQL query to count how many friends each user has.
- SELECT UserProfile.Username, COUNT(Friendship.FriendshipID) AS FriendCount
- FROM UserProfile
- LEFT JOIN Friendship ON UserProfile.UserID = Friendship.UserID1
- WHERE Friendship.Status = 'Accepted'
- GROUP BY UserProfile.Username;

## Winter exam – 2024/2025 – TU857

- Write an SQL query to retrieve the user’s name and the total calories burned by each user. Rename the resulting columns as “Name” and “Total Calories”
- SELECT UserProfile.Username “Name”, SUM(Workout.CaloriesBurned) “Total Calories”
- FROM UserProfile
- LEFT JOIN Workout USING (UserID)
- GROUP BY UserProfile.Username;
