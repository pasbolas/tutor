# Week 12 - Databases review - part 2


## Module review – part 2Dr Mariana RochaSchool of Computer Science

- CMPU 2007 Databases 1, Lecture 12

## Inserting data

  - Before inserting data, consider:
    - The format of the table (the columns and their constraints)
    - The type of insert:
      - Full insert
      - Partial insert
  - All CHAR,VARCHAR and DATE fields must have their values surrounded by single quotes.
  - If we do not include a column list, PostgreSQL assumes you are inserting data in the column order it expects.
- INSERT INTO table (column1, column2, ... column_n ) VALUES  (expression1, expression2, ... expression_n );

## Winter exam – 2023/24


## Winter exam – 2023/24

- The following SQL queries were written as an attempt to insert data into the video game database. However, each query returned an error. Identify and explain the errors in the queries below:
- INSERT INTO Movie
- VALUES (102, 'The Shawshank Redemption', 1994, 'Frank Darabont');
- INSERT INTO Actor (ActorID, FirstName, LastName)
- VALUES (201, Tom, Hanks);
- INSERT INTO Movie (MovieID, Title, ReleaseYear, GenreID, Director)
- VALUES (101, 'Inception', 2010, 1, 'Christopher Nolan', 'christopher.nolan@gmail.com');

## Winter exam – 2023/24

- INSERT INTO Movie
- VALUES (102, 'The Shawshank Redemption', 1994, 'Frank Darabont');
- INSERT INTO Actor (ActorID, FirstName, LastName)
- VALUES (201, Tom, Hanks);
- INSERT INTO Movie (MovieID, Title, ReleaseYear, GenreID, Director)
- VALUES (101, 'Inception', 2010, 1, 'Christopher Nolan', 'christopher.nolan@gmail.com');
- The first SQL statement attempts to do a partial insertion without listing the attributes, which results in a “not enough values” error.
- The second SQL statement attempts to insert a string value without single quotes, which results in an error.
- The third SQL statement attempts to insert more values than attributes available, resulting in the error “too many values”.

## Using the NULL Conditions

- Test for nulls with the IS NULL operator.
- SELECT firstname, lastname FROM mm_customer
- WHERE on_mailing_list IS NULL;

## Using the NULL Conditions

- Test for non null values with the IS NOT NULL operator.
- SELECT firstname, lastname FROM mm_customer
- WHERE on_mailing_list IS NOT NULL;

## Winter exam – 2023/24


## Winter exam – 2023/24

- Write an SQL query to list the full names of actors who have never been in any movies.
- SELECT CONCAT(A.FirstName, ' ', A.LastName) "FullActorName"
- FROM Actor A
- LEFT JOIN MovieActor MA ON A.ActorID = MA.ActorID
- WHERE MA.MovieID IS NULL;

## SQL Functions

- Function
- Input
- arg 1
- arg 2
- arg n
- Function performs action
- Output
- Result  value

## Two Types of SQL Functions

- Single-row  functions
- Multiple-row  functions
- Return one result  per row
- Return one result  per set of rows
- Functions

## Winter exam – 2024/25

- The following relational schema and interpretation will be used in subsequent questions:
- A team of developers designed a database system for managing information related to a social media platform. This platform allows users to share posts, like posts, and connect with friends.
- The database structure includes tables such as User, Post, Like, and Friendship. Users can view posts shared by their friends, besides being able to like posts, and interact with the platform by sharing their own content.

## Winter exam – 2024/25

- Write an SQL query to retrieve each post's title along with its average number of likes.
- SELECT P.Title, AVG(L.LikeCount) AS AverageLikes
- FROM Post P
- JOIN "Like" L ON P.PostID = L.PostID
- GROUP BY P.Title;

## Types of Group Functions

- AVG
- COUNT
- MAX
- MIN
- SUM
- Group  functions

## Restricting group results with the HAVING clause

- SELECT  FROM  [WHERE
- column, group_function  table
- condition]
- [GROUP BY group_by_expression]  [HAVING	group_condition]  [ORDER BY column];
- When you use the HAVING clause, the PostgreSQL server restricts groups as follows:
  - Rows are grouped by the expression you have given.
  - The group function is applied.
  - Groups matching the HAVING clause are displayed.

## Winter exam – 2016/2017


## Winter exam – 2016/2017

- Suppose we want to calculate the total number of services used by a guest on a particular visit. Write SQL to achieve this.
- Restrict the output so that only bookings with IDs between 1001 and 1005 are included. Format your output to follow this template:
- ‘The number of services used in by <guestID> in <bookingID> is <no. of services>.’
- Hint: You do not include the < > in your output. Retrieve bookingID, guestID and calculate the no. of product.
- SELECT 'The total number of services used in booking ' || bookingId || ' by ' || guestId || ' is ' || count(serviceID)
- FROM serviceBooking
- GROUP BY bookingId,guestID
- HAVING bookingID BETWEEN 1001 AND 1005;

## Winter exam – 2023/2024

- Write an SQL query that retrieves the average rating for each movie in the Review table, along with the movie title.
- SELECT M.Title, AVG(R.Rating) "Average Rating"
- FROM Movie AS M
- JOIN Review AS R ON M.MovieID = R.MovieID
- GROUP BY M.Title;

## JOINS

- Inner Join: returns only matched rows between two tables
- Outer Join: a join between two tables that returns the results of the inner join as  well as the unmatched rows from the left (or right) tables is called a  left (or right) outer join.

## Inner join

- Return the set of  records that  match in both Table A and Table B.

## Full outer join

- Return the set of all records in Table A and Table B, with matching records from both sides where available.
- If there is no match, the columns from the missing side will be returned as null.

## Left outer join

- Return the set of records from Table A, with the matching  records (where  available) in Table B. If there is no match,  the columns from  the right side will  contain null.

## Right outer join

- Table A
- Table B
- Return the set of  records from Table B,  with the matching  records (where  available) in Table A.
- If there is no match,  the columns from  the left side will  contain null.

## Winter exam – 2022/2023


## Winter exam – 2022/2023

- Q2a) Considering the relations between the tables game, game_publisher and sale, write the SQL query to retrieve the game_name, genre_id, publisher_name, and number_of_sales.
- SELECT game_name, genre_id, publisher_name, number_of_sales
- FROM game
- JOIN game_publisher USING (publisher_id)
- JOIN sale USING (publisher_id);

## Winter exam – 2022/2023

- Q2b) Rewrite the query you provided in question 2 (a) but modify the output by:
- Renaming the columns as “Game Title”, “Genre Identifier”, “Name of the publisher”, “Sales”.
- Display game_name and publisher_name in lowercase
- SELECT lower(game_name) “Game title”, genre_id “Genre identifier”, lower(publisher_name) “Name of the publisher”, number_of_sales “Sales”
- FROM game
- JOIN game_publisher USING (publisher_id)
- JOIN sale USING (publisher_id);

## Winter exam – 2022/2023

- Q3d) (d)  To implement an efficient and consistent database, some integrity rules should be followed. Explain each of the following integrities and give examples of how these were followed in the video game database presented in question 1.
- Entity integrity
- Domain integrity
- Referential integrity
- Entity integrity: Ensures a unique, non-null value per row by using a unique identifier (primary key). One example is the attribute publisher_id.
- Domain integrity: Ensures that only valid values can be input into columns, according to their datatype and value constraints. One example is the constraint added to the attribute publisher_email.
- Referential integrity: Ensure consistency of values in tables that are related by adding a primary key of one table as a foreign key of another table. One example is the attribute publisher_id in the table game.

## Semester 2 exam – 2024/2025 – TU857

- FitLife is a social fitness tracking app designed for people who want to track workouts, set fitness goals, and engage with friends in a social fitness environment. The app allows users to:
- Log workouts (e.g., running, weightlifting, yoga).
- Set fitness goals and track progress.
- Connect with friends and compare stats.
- Leave comments on workouts to encourage each other.
- The database stores users, workouts, fitness goals, comments, and friendships.
- The following ERD represents the database that is part of the FitLife app.

## Semester 2 exam – 2024/2025 – TU857

- Q1(b) Write an SQL query to retrieve the usernames of users who have never logged a workout.
- SELECT Username
- FROM UserProfile
- LEFT JOIN Workout USING (UserID)
- WHERE Workout.UserID IS NULL;

## Semester 2 exam – 2024/2025 – TU857

- Q1(c) Write an SQL query to retrieve the user’s name and the total calories burned by each user. Rename the resulting columns as “Name” and “Total Calories”
- SELECT UserProfile.Username “Name”, SUM(Workout.CaloriesBurned) “Total Calories”
- FROM UserProfile
- LEFT JOIN Workout USING (UserID)
- GROUP BY UserProfile.Username;

## VIEWS

- A database view is a logical or virtual table based on a  query.
- It is useful to think of a view as a stored query.
- They are useful ways of presenting different information  to different users.
- Views are created through use of a CREATE VIEW command that  incorporates use of the SELECT statement and queried just like tables.

## Defining Views

- Suppose we have the following table:
  - Employee(PRSINO, name, department,  project, salary)
- Our HR department has permission to view information  about all employees but the manager of the IT department only has permission to view the name of  their staff and the name of the project on which they are currently working
- We can create a view for the IT manager
- CREATE VIEW IT AS
- SELECT name, project FROM Employee
- WHERE department = ‘IT’;

## Winter exam – 2018/2019


## Slide 34

- Using UNION write the SQL needed to create a VIEW called FacilityUse which has details about the number of bookings for each facility. You need to:
- Include a column facility which is the facility description;
- Include a column bookings which holds the number of bookings for that facility.
- The SQL should be based on the SQL you wrote for parts (a) and (b) so you will need to ensure a row is included for each facility whether it has bookings or not.
- Winter exam – 2018/2019
- CREATE VIEW FacilityUse AS
- SELECT facilitydesc AS facility, count(teamno) AS bookings
- FROM facilitybooking
- JOIN sportfacility USING (facilityid)
- GROUP BY facilitydesc
- UNION
- SELECT facilitydesc AS facility, count(teamno) AS bookings
- FROM facilitybooking
- RIGHT OUTER JOIN sportfacility USING(facilityid)
- GROUP BY facilitydesc
- HAVING count(teamno)=0;

## Slide 35

- UNION/UNION ALL
- A
- B
- A
- B
- INTERSECT
- A
- B
- MINUS
- Set Operators
- A
- B

## Using the UNION Operator

- Display the current and previous job details of all  employees. Display each employee only once, removing duplicates.
- SELECT employee_id, job_id FROM employees
- UNION
- SELECT employee_id, job_id FROM job_history;

## Using the UNION ALL Operator

- Display the current and previous departments of all employees, including duplicates.
- …
- …
- SELECT employee_id, job_id, department_id FROM employees
- UNION ALL
- SELECT employee_id, job_id, department_id FROM job_history
- ORDER BY employee_id;

## Using the INTERSECT Operator

- Display the employee IDs and job IDs of those  employees who currently have a job title that is the same as their job title when they were initially hired (that is, they changed jobs but have now gone back to doing their original job).
- SELECT employee_id, job_id FROM employees
- INTERSECT
- SELECT employee_id, job_id FROM job_history;

## EXCEPT Operator

- Display the employee IDs of those employees who have not changed their jobs even once.
- …
- SELECT employee_id,job_id FROM employees
- EXCEPT
- SELECT employee_id,job_id FROM job_history;

## Winter exam – 2018/2019


## Slide 41

- Using INTERSECT, write the SQL to find the students who are captain of at least one team and a player for at least one other.
- You need only output studentno, firstname and lastname.
- Winter exam – 2018/2019
- SELECT studentno, firstname, lastname
- FROM teammember
- JOIN student USING (studentno)
- WHERE teamrole='Captain'
- INTERSECT
- SELECT studentno, firstname, lastname
- FROM teammember
- JOIN student USING (studentno)
- WHERE teamrole='Player’ OR teamrole IS NULL;
