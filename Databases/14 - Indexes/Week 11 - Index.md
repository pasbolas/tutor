# Week 11 - Index


## IndexDr Mariana RochaSchool of Computer Science

- CPMU 2007 Databases 1, Lecture 11

## Slide 2


## Index

- A database index is like a book index: it helps locate data faster.
- It stores key values in a separate data structure.
- Without indexes, PostgreSQL must scan every row (sequential scan).
- When you search for a customer in a large table, PostgreSQL checks each row unless there’s an index.
- An index allows PostgreSQL to “jump” directly to the relevant rows.

## Index

- Book without index → you read every page.
- Book with index → you look up the term directly.

## Similar to pointers

- In C, a pointer stores the memory address of a variable. In PostgreSQL, an index stores the location (address) of a row. So when you write:
- PostgreSQL uses the index to look up 'C3' in the index structure (like finding an address) and follow the stored “pointers” to the exact row in the booking table.
- That’s very similar to:
- The pointer lets you jump directly to the memory address just like the index lets the database jump directly to the row.
- SELECT * FROM booking WHERE customer_id = 'C3';
- int value = 42;
- int *ptr = &value; // pointer to variable 'value'
- printf("%d", *ptr); // follow the pointer to get the value

## Explain analyze

- We can use the combination of the commands EXPLAIN and ANALYZE
- Explain: retrieve the execution plan, showing how the table will be scanned (for example, by a plain sequential scan), how the algorithm brings together the required rows from each input table (in case of joins) etc. The statement is not executed, only analysed.
- Analyze: Carry out the command and show actual run times and other statistics. Even though we can use the analyze command on its own, it is common to combine it with the explain command.

## EXPLAIN ANALYZE

- EXPLAIN ANALYZE shows how the query was executed — it tells us if an index was used and how long it took.
- EXPLAIN ANALYZE SELECT * FROM booking WHERE customer_id = 'C09142';

## Creating an index

- Now PostgreSQL will maintain this index automatically.
- When we query booking by customer_id, it will use this index instead of scanning the full table.
- CREATE INDEX idx_booking_customer ON booking (customer_id);

## When to use indexes

- Columns often used in WHERE, JOIN, or ORDER BY
- Large tables (thousands of rows)
- Each index speeds up reads but slows down writes (INSERT, UPDATE, DELETE).
- Balance performance: only index what’s queried often.

## Composite indexes

- Combine two or more columns in one index.
- Useful when queries filter on those columns together.
- Column order matters: (concert_id, customer_id) ≠ (customer_id, concert_id)
- PostgreSQL will use this index when both concert_id and customer_id are in the WHERE clause — or even when filtering by concert_id alone, since it’s the first column in the index.
- Let’s measure how much faster it can be.

## Composite indexes

- --Composite indexes
- --Before index
- EXPLAIN ANALYZE SELECT * FROM customer WHERE customer_fname = 'Alice Anderson' AND city = 'San Francisco';
- DROP INDEX IF EXISTS idx_customer_name_city;
- CREATE INDEX idx_customer_name_city
- ON customer (customer_fname, city);
- EXPLAIN ANALYZE SELECT * FROM customer WHERE customer_fname = 'Alice Anderson' AND city = 'San Francisco';

## Composite indexes – the order matter

- Combine two or more columns in one index.
- Useful when queries filter on those columns together.
- Column order matters: (concert_id, customer_id) ≠ (customer_id, concert_id)
- PostgreSQL will use this index when both concert_id and customer_id are in the WHERE clause — or even when filtering by concert_id alone, since it’s the first column in the index.
- Let’s measure how much faster it can be.

## Multicolumn index – the order matters

- The order of columns in the index is important because the index is sorted primarily by the first column, then by the second column, and so on.
- A query must use the leading column(s) in the index to benefit from the index. If the query does not use the first column, the index will not be used effectively.
- For the index multi_idx ON person (last_name, first_name);
  - Queries like WHERE last_name = 'Smith' or WHERE last_name = 'Smith' AND first_name = 'John' will use the index.
  - Queries like WHERE first_name = 'John' will not use the index because last_name is not included.

## Faster queries, extra memory

- As you can imagine, by creating a data structure that guides the data retrieval, indices use some extra memory.
- We can check how much space is taken by running the function pg_relation_size( )
- --Memory check
- --How much disk space the rows themselves take
- SELECT pg_size_pretty(pg_relation_size('customer')) AS table_size;)
- --How much storage one specific index consumes.
- SELECT pg_size_pretty(pg_relation_size('idx_customer_name_city')) AS table_size;)

## Databases indices

- PostgreSQL uses different data structures for indices – we can choose among B-tree, Hash, Gist etc.
- B-tree is the default one, fitting most situations

## Balanced tree (B-tree)

- B-trees are balanced tree structures where each node can have multiple children. The data is organised hierarchically, with nodes containing ranges of values and pointers to child nodes.
- Provides logarithmic time complexity for searches, and remains balanced despite frequent insertions and deletions.

## Balanced tree (B-tree)

- B-trees can handle equality and range queries on data that can be sorted into some ordering. ORDER BY queries can be used.
- Commonly used when comparison operators are involved, such as < ,  <= ,  = ,  >=  and  >.
- BETWEEN and IN can also be implemented with a B-tree index search. Also, an IS NULL or IS NOT NULL condition on an index column can be used with a B-tree index.
- B-tree indexes can also be used to retrieve data in sorted order. This is not always faster than a simple scan and sort, but it is often helpful.

## Balanced tree (B-tree)


## Data structure

- We can also decide what data structure we want to use
- In this example, we are creating an index using a B-TREE
- --deciding the data structure for your index
- EXPLAIN ANALYZE SELECT * FROM booking WHERE price_paid BETWEEN 10 AND 50;
- DROP INDEX idx_price;
- CREATE INDEX idx_price ON booking USING btree(price_paid);
- EXPLAIN ANALYZE SELECT * FROM booking WHERE price_paid BETWEEN 10 AND 50;

## Slide 20


## Partial index

- Partial indexes are indexes built on a subset of data that meets a specified condition. For example, if you often query for people with a specific last name:
- When searching for rows with that specific value for the last_name attribute, we have a speed gain:
- CREATE INDEX idx_last_name_smith ON person(last_name) WHERE last_name = 'Smith';
- explain analyze select * from person where last_name = 'Smith';
- Before creating an index:
- After creating an index:

## Partial index

- Partial indexes store only a subset of rows.
- This is useful when most queries focus on a small subset.
- DROP INDEX idx_large_stages;
- CREATE INDEX idx_large_stages ON stage (stage_name) WHERE audience_capacity > 100;

## JOIN

- A common query could be to retrieve the name of the artist and how much they got paid.
- We can create indexes to speed up this common query.
- DROP INDEX IF EXISTS idx_concert_artist, idx_booking_concert;
- CREATE INDEX IF NOT EXISTS idx_concert_artist ON concert(artist_id);
- CREATE INDEX IF NOT EXISTS idx_booking_concert ON booking(concert_id);
- EXPLAIN ANALYZE
- SELECT artist_name, SUM(price_paid)
- FROM booking
- JOIN concert USING (concert_id)
- JOIN artist USING (artist_id)
- WHERE artist_name = 'Lady Gaga Band'
- GROUP BY artist_name;

## Order by

- An index may be able to deliver them in a specific sorted order.
- Only B-tree can produce sorted output — the other index types return matching rows in an unspecified, implementation-dependent order.
- Suppose we want to retrieve all the last_names in descending order:
- The explain analyze command will show it takes a while to retrieve the data in that format:
- explain analyze select last_name from person order by last_name desc;

## Order by

- Without an index, PostgreSQL must sort results manually.
- With a matching index, PostgreSQL reads in sorted order directly from the index (no Sort step)
- DROP INDEX IF EXISTS idx_booking_price;
- CREATE INDEX idx_booking_price ON booking (price_paid);
- EXPLAIN ANALYZE
- SELECT booking_id, price_paid
- FROM booking
- ORDER BY price_paid; -- we can add DESC as well

## Unique indexes

- A unique index ensures that the values in a column (or a group of columns) are unique across the table.
- It works similarly to adding the word UNIQUE to the DDL, but it allows more flexibility and control – you can quickly drop an index or make it multi-column.
- DROP INDEX IF EXISTS idx_customer_email;
- CREATE UNIQUE INDEX idx_customer_email ON customer (email_address);

## Indexes on expressions

- PostgreSQL allows indexing not just on columns but also on expressions.
- n index on an expression stores the result of a function applied to a column so PostgreSQL can use that precomputed value to speed up queries that use the same expression.
- EXPLAIN ANALYZE
- SELECT *
- FROM customer
- WHERE LOWER(customer_fname) = 'john doe';
- DROP INDEX IF EXISTS idx_customer_fname_lower;
- CREATE INDEX idx_customer_fname_lower
- ON customer (LOWER(customer_fname));

## When to use

- Indexes help when your query can skip work:
  - Add a selective WHERE, or match ORDER BY … LIMIT, or enable index-only scans.
- Indexes do not help full-table aggregates or broad scans where most rows qualify.
- Always confirm with EXPLAIN ANALYZE and make sure the time to run the query drops
