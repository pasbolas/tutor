# Week 10 - Case study


## Case studyDr Mariana RochaSchool of Computer Science

- CMPU 2007 Databases 1, Lecture 10

## Objectives

- In this class, we will follow a case study to:
  - Build a database from scratch
  - Populate the database using GenAI
  - Answer queries about the database
  - Modify the database

## SoundWave Festival

- SoundWave is an annual music festival that hosts several concerts over a few days. Each concert is performed by a single artist, takes place on one stage, and is attended by many customers who purchase tickets. The organisers want to build a simple database to manage festival information, including artists, stages, concerts, customers, and bookings. The database should store:
  - Details of each artist, such as their name and music genre.
  - Information about each stage, including its name and audience capacity.
  - Records of every concert, linking the artist performing, the stage, the concert date, and start time.
  - Information about customers, including their full name and city.
  - Each booking, showing which customer attended which concert, how many tickets they bought, and the total price paid.

## Building the tables

- Use SQL to:
  - Build the tables
  - List the attributes
  - Establish data types and constraints

## Adding data

- Using a Gen AI tool, insert at least 20 rows into each table you created.

## Questions

- Now, let’s take some time to answer the following questions.

## Question 1

- Show each customer’s name, artist they went to see, and total tickets they booked.
- Then, modify your query to also retrieve the name of the stage where the concert took place.

## Question 2

- Find average ticket price per artist. Your resulting table should show two columns: one with the artist name, and another one with the average price paid for their concerts.

## Question 3

- Which artists sold more than 3 tickets in total? Your resulting table should show two columns: one with the name of the artist, and another one with how many tickets they sold in total.

## Question 4

- Classify stages by size: ‘Large’ if capacity ≥4000, else ‘Medium. Your resulting query should show two columns: one with the name of the stage, and another one with the capacity classification.

## Question 5

- List concerts happening on the largest stage. Your resulting query should show 3 columns:
  - The ID of the concert
  - The name of the artist
  - The name of the stage

## Question 6

- For each city, show total revenue of bookings.

## Question 7

- Write a query that shows something interesting about the festival data.

## Question 8

- The festival organisation team decided to standardise pricing. Update all bookings so that any booking for concerts performed by Pop artists has its total_price increased by 10% compared to its current value.

## Question 9

- One stage, called Arena, is being renovated and all its concerts are cancelled.
- Remove all bookings linked to concerts that were scheduled on this stage.
