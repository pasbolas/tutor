# Week 5 - Character functions


## SQL Functions – Character functionsDr Mariana RochaSchool of Computer Science

- CPMU 2007 Databases 1, Lecture 5

## What are Functions in SQL

- So far, we have looked at how we can use SELECT queries to find specific values
- Functions are pre-built pieces of functionality that we can perform on our databases quickly and easily
- Functions can allow us to
  - Perform calculations on data
  - Modify individual data items
  - Manipulate output for groups of rows
  - Format dates and numbers for display
  - Convert column data types

## SQL Functions

- SQL functions sometimes take arguments and always return a value.
- SQL has a long list of built-in functions
- SQL Functions

## SQL Functions

- Function
- Input
- arg 1
- arg 2
- arg n
- Function performs action
- Output
- Result
- value
- SQL Functions

## Slide 5

- Single-row
- functions
- Multiple-row
- functions
- Return one result
- per row
- Return one result
- per set of rows
- Functions
- Types of SQL Functions

> **Notes:** SQL Functions (continued)
There are two types of functions:
Single-row functions
Multiple-row functions
Single-Row Functions
These functions operate on single rows only and return one result per row. There are different types of single-row functions. This lesson covers the following ones:
Character
Number
Date
Conversion
General
Multiple-Row Functions
Functions can manipulate groups of rows to give one result per group of rows. These functions are also known as group functions (covered in a later lesson).
Note: For more information and a complete list of available functions and their syntax, see Oracle SQL Reference.

## Slide 6

- Single-row functions:
  - Manipulate data items
  - Access and works on each row and return a value per row
  - May return a value of a data type different to that referenced
  - Can be nested
  - Accept arguments that can be a column or an expression
- function_name [(arg1, arg2,...)]
- Single-row functions

> **Notes:** Single-Row Functions
Single-row functions are used to manipulate data items. They accept one or more arguments and return one value for each row that is returned by the query. An argument can be one of the following:
User-supplied constant
Variable value 
Column name
Expression
Features of single-row functions include:
Acting on each row that is returned in the query
Returning one result per row
Possibly returning a data value of a different type than the one that is referenced
Possibly expecting one or more arguments
Can be used in SELECT, WHERE, and ORDER BY clauses; can be nested
In the syntax:
function_name	is the name of the function
arg1, arg2		is any argument to be used by the function. This can be 				represented by a column name or expression.

## Slide 7

- An argument can be one of the following:
  - User-supplied constant
  - Column name
  - Expression
- Can be used in
  - Select
  - Where
  - Order By
  - Constraint
- function_name [(arg1, arg2,...)]
- Single-row functions

> **Notes:** Single-Row Functions
Single-row functions are used to manipulate data items. They accept one or more arguments and return one value for each row that is returned by the query. An argument can be one of the following:
User-supplied constant
Variable value 
Column name
Expression
Features of single-row functions include:
Acting on each row that is returned in the query
Returning one result per row
Possibly returning a data value of a different type than the one that is referenced
Possibly expecting one or more arguments
Can be used in SELECT, WHERE, and ORDER BY clauses; can be nested
In the syntax:
function_name	is the name of the function
arg1, arg2		is any argument to be used by the function. This can be 				represented by a column name or expression.

## Slide 8

- \
- Conversion
- Character
- Number
- Date
- General
- Single-row
- functions
- Accept character input
- Returns a single value
- Can return both character and numeric values
- Accepts numeric input
- Returns a single  numeric value
- Operate on date data type
- Returns a value of date data type
- Convert a value from one data type to another
- Handle NULL values or selection of return value based on choices
- Single-row functions

> **Notes:** Single-Row Functions (continued)
This lesson covers the following single-row functions:
Character functions: Accept character input and can return both character and number values
Number functions: Accept numeric input and return numeric values
Date functions: Operate on values of the DATE data type (All date functions return a value of DATE data type except the MONTHS_BETWEEN function, which returns a number.)
Conversion functions: Convert a value from one data type to another
General functions:
NVL
NVL2
NULLIF
COALESCE
CASE
DECODE

## Slide 9


> **Notes:** Character Functions
Single-row character functions accept character data as input and can return both character and numeric values. Character functions can be divided into the following:
Case-manipulation functions
Character-manipulation functions

Note: The functions discussed in this lesson are only some of the available functions.

## Slide 10

- Character
- functions
- Case-manipulation
- functions

> **Notes:** Character Functions
Single-row character functions accept character data as input and can return both character and numeric values. Character functions can be divided into the following:
Case-manipulation functions
Character-manipulation functions

Note: The functions discussed in this lesson are only some of the available functions.

## Slide 11

- We will look at examples using the following database

## Slide 12

- Character functions can be used to convert strings to uppercase or lowercase using the UPPER( ) and LOWER( ) functions.
- Case manipulation: upper( ) and lower( )
- -- Uppercase research titles for display
- SELECT title, UPPER(title) "Upper Title"
- FROM research;
- -- Lowercase venues for standardised export
- SELECT venue, LOWER(venue) "Lower Title"
- FROM publication;

> **Notes:** Character Functions
Single-row character functions accept character data as input and can return both character and numeric values. Character functions can be divided into the following:
Case-manipulation functions
Character-manipulation functions

Note: The functions discussed in this lesson are only some of the available functions.

## Slide 13

- It can also be used to manipulate WHERE conditions.
- Case manipulation: upper( ) and lower( )
- -- Case-insensitive search for a scientist by last name
- SELECT firstname, lastname
- FROM scientist
- WHERE LOWER(lastname) = 'murphy';

> **Notes:** Character Functions
Single-row character functions accept character data as input and can return both character and numeric values. Character functions can be divided into the following:
Case-manipulation functions
Character-manipulation functions

Note: The functions discussed in this lesson are only some of the available functions.

## Slide 14

- Character
- functions
- Character-manipulation
- functions

> **Notes:** Character Functions
Single-row character functions accept character data as input and can return both character and numeric values. Character functions can be divided into the following:
Case-manipulation functions
Character-manipulation functions

Note: The functions discussed in this lesson are only some of the available functions.

## Slide 15

- It can be used to modify how the data is presented:
- Case manipulation: concatenate( )
- SELECT CONCAT(TRIM(firstname), ' ', TRIM(lastname), ' (', TRIM(uniname), ')') " Scientist affiliation"
- FROM scientist
- JOIN university USING (uni_id);

> **Notes:** Character Functions
Single-row character functions accept character data as input and can return both character and numeric values. Character functions can be divided into the following:
Case-manipulation functions
Character-manipulation functions

Note: The functions discussed in this lesson are only some of the available functions.

## Slide 16

- Extracts part of a string:
- Case manipulation: substring( )
- -- First 5 chars of university names (spot prefixes & duplicates)
- SELECT uniname,
- SUBSTRING(uniname FROM 1 FOR 10) "Uni prefix"
- FROM university;

> **Notes:** Character Functions
Single-row character functions accept character data as input and can return both character and numeric values. Character functions can be divided into the following:
Case-manipulation functions
Character-manipulation functions

Note: The functions discussed in this lesson are only some of the available functions.

## Slide 17

- The LENGTH function returns the length of a string. It can be used for data validation or to manage constraints.
- Case manipulation: length( )
- -- Research title length
- SELECT research_id, LENGTH(title) "Research title length"
- FROM research
- ORDER BY title_len DESC;

> **Notes:** Character Functions
Single-row character functions accept character data as input and can return both character and numeric values. Character functions can be divided into the following:
Case-manipulation functions
Character-manipulation functions

Note: The functions discussed in this lesson are only some of the available functions.

## Slide 18

- Find the position of a substring within a string in the database you provided earlier
- Case manipulation: position( )
- -- Find titles mentioning 'AI' anywhere
- SELECT research_id, title,
- POSITION('AI' IN UPPER(title)) "Position AI"
- FROM research
- WHERE POSITION('AI' IN UPPER(title)) > 0;

> **Notes:** Character Functions
Single-row character functions accept character data as input and can return both character and numeric values. Character functions can be divided into the following:
Case-manipulation functions
Character-manipulation functions

Note: The functions discussed in this lesson are only some of the available functions.

## Slide 19

- Pads a string on the left or right side with a specified character or characters until it reaches the desired length.
- These functions are mostly used for formatting the data in a certain way. The syntax is:
- LPAD(string, length, fill_string) or LRPAD(string, length, fill_string)
- Case manipulation: lpad( ) and rpad( )

> **Notes:** Character Functions
Single-row character functions accept character data as input and can return both character and numeric values. Character functions can be divided into the following:
Case-manipulation functions
Character-manipulation functions

Note: The functions discussed in this lesson are only some of the available functions.

## Slide 20

- Case manipulation: lpad( ) and rpad( )
- -- Zero-padded research codes (for reports)
- SELECT research_id, 'RS-' || LPAD(CAST(research_id AS VARCHAR), 5, '0') "Research code"
- FROM research
- ORDER BY 1;

> **Notes:** Character Functions
Single-row character functions accept character data as input and can return both character and numeric values. Character functions can be divided into the following:
Case-manipulation functions
Character-manipulation functions

Note: The functions discussed in this lesson are only some of the available functions.

## Slide 21

- Used to replace occurrences of a substring within a string.
- Case manipulation: replace( )
- -- Normalise hyphenated last names to space-separated
- SELECT sci_id,
- lastname "Last name",
- REPLACE(lastname, '-', ' ') "Normalised lastname"
- FROM scientist
- WHERE lastname LIKE '%-%';

> **Notes:** Character Functions
Single-row character functions accept character data as input and can return both character and numeric values. Character functions can be divided into the following:
Case-manipulation functions
Character-manipulation functions

Note: The functions discussed in this lesson are only some of the available functions.

## Slide 22

- Removes leading and trailing spaces from a string. Trim function is mostly used for database cleanup and formatting.
- Case manipulation: trim( )
- -- Clean leading/trailing spaces from names
- SELECT firstname "Raw first name", length(firstname) "First name size",
- TRIM(firstname) "Trimmed first name", length(trim(firstname)) "First name size after trimming"
- FROM scientist
- WHERE firstname LIKE ' %' OR firstname LIKE '% ';

> **Notes:** Character Functions
Single-row character functions accept character data as input and can return both character and numeric values. Character functions can be divided into the following:
Case-manipulation functions
Character-manipulation functions

Note: The functions discussed in this lesson are only some of the available functions.

## Slide 23

- Adding a WHERE clause
- -- Case-insensitive exact match for a project code prefix within the title
- SELECT *
- FROM research
- WHERE LOWER(title) LIKE '%quantum study';
- -- Case-sensitive (likely fewer or no matches, depending on data)
- SELECT *
- FROM research
- WHERE title LIKE '%quantum study';

## Slide 24

- We can concatenate values using || or the function concat( ).
- Concat( ) can be a bit more efficient when we have many arguments.
- Another way of concatenating
- -- Using ||
- SELECT 'Scientist ' || sci_id || ': ' || UPPER(lastname) || ', ' || INITCAP(TRIM(firstname)) "Information"
- FROM scientist
- LIMIT 10;
- -- Using CONCAT (two-arg chaining)
- SELECT CONCAT('Scientist ', sci_id, ': ', UPPER(lastname), ', ', INITCAP(TRIM(firstname))) "Information"
- FROM scientist
- LIMIT 10;

## Slide 25

- Be aware: when we use || to concatenate two values and one is NULL, the result is a NULL value. This way:
  - 'a' || NULL → NULL
  - CONCAT('a', NULL) → 'a’
  - As we usually prefer to keep any value that is not null, give preference to using concat( )
  - You can also use concat_ws( sep, arg), which will take a separator and arguments, skipping the NULL ones. Ws stands for “with separator”
- Another way of concatenating
- SELECT 'a' || NULL;
- SELECT concat('a', NULL);
- SELECT concat_ws(' , ', 'a', NULL, 'b');

## Slide 26

  - Single-row functions can be nested
  - Nested functions are evaluated from deepest level to the least deep level.
- F3(F2(F1(col,arg1),arg2),arg3)
- Step 1 = Result 1
- Step 2 = Result 2
- Step 3 = Result 3
- Nesting functions

> **Notes:** Nesting Functions
Single-row functions can be nested to any depth. Nested functions are evaluated from the innermost level to the outermost level. Some examples follow to show you the flexibility of these functions.

## Slide 27

- --Nested functions
- -- Lastname stub + country suffix, uppercased
- SELECT lastname,
- UPPER(CONCAT(SUBSTRING(REGEXP_REPLACE(lastname, '\s+', '', 'g') FROM 1 FOR 8), '_IRL’)) “Tag”
- FROM scientist
- JOIN university USING (uni_id)
- WHERE university.country = 'Ireland'
- LIMIT 15;
- Nesting functions

## Slide 28

