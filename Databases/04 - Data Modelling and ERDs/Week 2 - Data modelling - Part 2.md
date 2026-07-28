# Week 2 - Data modelling - Part 2


## Data modelling – Part 2Dr Mariana RochaSchool of Computer Science

- CMPU 2007 Databases 1, Lecture 2

## Difference between Logical and Physical Design

- Logical Modelling
  - Conceptual
  - Revolves around the needs of the business, not the database, although the needs of the business are used to establish the needs of the database.
  - Involves gathering information about business processes, business entities (categories of data), and organizational units
  - It is ok to have many to many relationships

## Difference between Logical and Physical Design

- Physical
  - Involves the actual design of a database according to the requirements that were established during logical modelling
  - Needs to be implementable in the type of database you are working with so we are converting our logical model to a relational data model
  - Need to resolve the many to many into a series of one to many introducing a weak entity

## Our Example

- What relationships exist between entities?
- A council can have many competitions.
- A competitions is run by a single council.
- Teams enrol in competitions.
- A team can enrol in many competitions.
- A competition can have many teams.
- What are the relationships at logical level?
- How do we resolve the Logical to a Physical Design?

## Another example – let’s build the model

- A college contains many departments
- Each department can offer any number of courses
- Many instructors can work in a department
- An instructor can work only in one department
- For each department, there is a Manager
- Each manager can manage only one department
- Each instructor can take any number of courses
- A course can be taught by only one instructor
- A student can enrol for any number of courses
- Each course can have any number of students

## Identify the entities

- What are the entities here?
- From the statements given, the entities are
  - College
  - Department
  - Course
  - Instructor
  - Student
  - Manager

## Additional Information

- Each department has a unique identifier, a name and a location associated with it
- Each course has a name and a duration
- Instructors and Students and Managers have first names, last names and phone numbers
- Each department, course, instructor, manager, and student have a unique id

## What are the attributes and datatypes

- For the department entity, attributes are id, name, location
- For course entity, attributes are id, course_name, duration
- For instructor entity, attributes are id, first_name, last_name, phone
- For student entity, attributes are id, first_name, last_name, phone

## What are the primary keys?

- ID can identify a department uniquely. Hence Department_ID is the key attribute for the Entity "Department".
- Course_ID is the key attribute for "Course" Entity.
- Student_ID is the key attribute for "Student" Entity.
- Instructor_ID is the key attribute for "Instructor" Entity.

## What are the constraints?

- Each department must have a name and a location associated with it
- Each course must have a name and a duration
- Instructors and Students and Managers must have first names, last names and phone numbers

## What are the relationships?

- One department offers many courses. But one particular course can be offered by only one department.
  - Hence the cardinality between department and course is One to Many (1:N)
- One department has multiple instructors . But instructor belongs to only one department.
  - Hence the cardinality between department and instructor is One to Many (1:N)
- One department has only one manager and one manager can manage only one department.
  - Hence the cardinality is one to one. (1:1)

## What are the relationships?

- One course can enrol many students and one student can enrol for many courses.
  - Hence the cardinality between course and student is Many to Many (M:N)
- One course is taught by only one instructor. But one instructor teaches many courses.
  - Hence the cardinality between course and instructor is Many to One (N :1)

## The model

- College is not shown but could be

## The model

- Primary keys are shown above the link
- Foreign Keys indicated by (FK) beside the column

## Summary

- A good data model is simple.
  - Data attributes that describe any given entity should describe only that entity.
  - Each attribute of an entity instance can have only one value.
- A good data model is essentially non-redundant.
  - Each data attribute describes at most one entity.
  - Look for the same attribute recorded more than once under different names.
- A good data model should be flexible and adaptable to future needs.

## How to create an ERD?

- To create an Entity Relationship Diagram, you can use:
- Reverse Engineering:
- - process of creating an ERD from an existing database system. It's essentially the reverse of the typical database design process.
- - used when you have an operational database but lack formal documentation or a clear understanding of its structure.
- Forward Engineering:
- - process of designing a database from scratch or making significant changes to an existing database system based on a well-defined data model.
- - we start with an ERD or a data model that represents the structure of the database you want to create. This model includes entities, attributes, and their relationships.

## Using Dbeaver – Reverse engineering

- The community (free version) of DBeaver only allows us to work with reverse engineering.
- To create the ERD using reverse engineering:
- - Run the code for your database creation (DDL)
- - Dropdown the menu on the left until you can see the list of tables (if you run the code and still cannot see any table, right-click and click on Refresh)
- - Right-click on Tables and click on View Diagram

## Slide 18


## Using pgAdmin 4 – Forward engineering

- You can use reverse and forward engineering on pgAdmin 4 (free, open-source). To do that:
- - connect to the server (we will be using localhost)
- - click on Tools and choose ERD Tool
- - Click on the + sign to add a table

## Slide 20


## Slide 21

