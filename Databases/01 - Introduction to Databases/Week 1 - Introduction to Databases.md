# Week 1 - Introduction to Databases


## Introduction to Databases 1Dr Mariana RochaSchool of Computer Science

- CPMU 2007 Databases 1, Lecture 1

## Learning Objectives

- Understand the concept of data
- Understand the concept of relational databases
- Familiarise with technical vocabulary
- Familiarise with SQL syntax

## What is data?

- From a Human perspective: Collection of values in a format that a human can conveniently read. Some human-readable formats, such as PDF, are not machine-readable as they are not structured data.
- From a machine perspective: Collection of values in a format that can be automatically read and processed by a computer, such as CSV,  JSON,  XML,  etc. Machine-readable data must be structured data.

## What is database?

- A database is a machine-readable structured	collection of data organised to model some aspect of reality typically available to a community of users, with possibly varying requirements.

## Databases are everywhere

- Databases form foundation of IT systems in areas such as
  - public administration (for example, Central Applications Office - CAO)
  - payroll, banking (account info)
  - retail (inventory)
  - health, electronic health records

## Backend

- Database is usually protected in the backend
- Not directly accessible by user
- Only your programs can talk directly to it

## So are we talking about spreadsheets?

- Not exactly. Spreadsheets have static information – stored data can be formatted, edited and manipulated within the cell.
- Spreadsheets are suitable for small datasets.
- Databases support:
  - Multi-user access
  - Security and permissions
  - Data integrity rules
  - Complex relationships

## Spreadsheet

- What issues could we have if this spreadsheet had 10,000 rows?

## Relational databases

- Instead of spreadsheets, we will focus on relational databases.
- Relational DBs are structured to organise the data in one or more tables, also called entities.
- The tables include columns (attributes) and rows. A specific ID identifies each row.

## Relational databases


## Advantage of relational databases

- Data can be easily tracked
- Data can be kept safe and correct (data integrity)
- Data is always consistency in any platform (for example, same account balance across banking mobile app, ATM, website...)
- Insulation between programs and data

## Database management system

- A Database Management System is software that manages databases.
- Examples: PostgreSQL, MySQL, Oracle, SQLite
- It handles data storage, querying, backups, and security.

## Database management system

- In this module, we will use PostgreSQL for managing our databases. This will be combined with the client-side DBeaver, the GUI used to write the code needed.
- We will write and manage the databases using the domain-specific language Structured Query Language (SQL).
- SQL can be used as a Data Definition Language (DDL, language for defining the data) and a Data Manipulation Language (DML, language for storing, retrieving and updating data in the DB).

## The anatomy of a relational database


## Relational Database

- Each table usually represents a ‘thing’ we are interested in storing data about
- Each row represents a single occurrence of this ‘thing’
- Each column represents a piece of data we want to store about this ‘thing’
- If two tables are related, the common data item appears on BOTH tables and allows us to navigate to the other table to retrieve additional data.

## Relational databases - Rules

- According to the relational model, all rows should be distinct.
- Values must be atomic (cannot be divided). No lists, sets, or arrays as single values (in theory).
- Every relation has a key (identifier).
- Data can be protected via constraints to ensure only data that conforms to requirements can be stored.

## ACID model

- Atomicity: A transaction must complete entirely or not at all – if one step fails, the entire operation fails. Transferring from account A to B only happens if account A has enough money.
- Consistency: The database must move from one valid state to another valid state, following all rules (constraints, types, relationships). You can't add a student to a course if the course ID doesn’t exist.
- Isolation: Even when many transactions happen at once, each one should act as if it’s the only one running. For example, two people booking the last ticket at the same time should not both succeed.
- Durability: If a transaction is completed and committed, it will be saved — even in the event of a crash or power failure. If you book a hotel room and get confirmation, that reservation won't disappear due to a server restart.

## Exercise – database brainstorm

- In pairs, choose a real-world system you use (such as Netflix, Instagram, Brightspace).
- Identify 3 tables and columns that their database can use.
- How are these tables related?
- What data types did you identify?

## DB constraints - Primary key (PK)

- A primary key is the column containing values that uniquely identify each row in a table.
- The values in the primary key column cannot change.
- It must always have a value
  - For example, students are always assigned a number as soon as they register. This value is unique, never changes and is always there.

## Primary key (PK)

- CREATE TABLE students (
- student_id TEXT primary key,
- name TEXT NOT NULL
- );

## DB constraints - Foreign key (PK)

- Foreign keys define relationships between tables
- A foreign key is a constraint that establishes a link between two tables by ensuring that the values in one table's column(s) match the values in another table's primary key column(s).
- That happens when a column of one table is the same as the primary key of another.

## Foreign key (PK)

- CREATE TABLE registration (
- student_id TEXT,
- course_code TEXT,
- foreign key (student_id) references students(student_id),
- foreign key (student_id) references students(student_id),
- primary key(student_id, course_code)
- );

## Metadata

- A database system contains not only the database itself but also a complete definition of the database structure and constraints (rules that the data must comply with).
- The metadata describes, for instance, characteristics of the data that can be stored in a particular column.

## PostgreSQL data types


## Data Definition Language (DDL)

- Syntax for creating, editing, deleting:
  - Databases
  - Tables
  - Views
  - Indexes
  - Constraints
  - Users
  - Privileges
- drop table example;
- create table example (example_name varchar(100), size int, Gc decimal(5), Accession varchar(10), release date, center varchar(100));
- alter table example add sequence varchar;

## Data Manipulation Language (DML)

- Syntax for executing queries, updating, inserting, 	and deleting records.
- SELECT - extracts data from one or more table
- INSERT INTO - inserts new data into a table
- UPDATE - updates data in a table
- DELETE FROM - deletes data from a table
- select * from example;

## Queries

- Queries are the information retrieval requests you make to the database
- Your queries are all about the information you are trying to gather (from that stored in the database)
- Queries = Question

## Queries

- SELECT firstname, lastname
- FROM student
- WHERE points >= 300;
- Meaning “Extract names (first and last) of all students with at least 300 points”
- SELECT, FROM, WHERE are keywords
- Other words are names of tables/columns
- >= means greater than or equal to
- Terminate query with a semicolon

## Let’s implement it using SQL


## Slide 30

- --Database with info on students
- --Dropping tables
- DROP TABLE IF EXISTS registration;
- DROP TABLE IF EXISTS students;
- DROP TABLE IF EXISTS courses;
- --Create tables student, course, registration
- CREATE TABLE courses (
    - course_code TEXT primary key,
    - course_title TEXT
- );
- CREATE TABLE students (
- student_id TEXT primary key,
- name TEXT NOT NULL
- );
- CREATE TABLE registration (
- student_id TEXT,
- course_code TEXT,
        - foreign key (student_id) references students(student_id),
- foreign key (course_code) references courses(course_code),
- primary key(student_id, course_code));

## Postgres and GenAI – database.build

- database.build is a free browser-based tool that uses AI to convert plain English descriptions into relational database schemas.
- You simply type a description into the browser, and it instantly generates an ER diagram, SQL CREATE TABLE statements, and a downloadable schema. Everything runs directly in the browser, with no installation or login required.

## Postgres and GenAI – database.build

- Let’s use a CSV dataset from Kaggle to check the database.build out.

## Learning outcomes

- By the end of this lesson, you should:
  - Understand what a relational database is
  - The basic structure of a relational database
  - Be familiar with some of the technical vocabulary used for databases
  - Have been introduced to SQL (Structured Query Language)
