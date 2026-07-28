# Lecture 5 - Number and date functions


## SQL Functions – Handling NULL values, numbers and datesDr Mariana RochaSchool of Computer Science

- CPMU 2007 Databases 1, Lecture 5

## Slide 2

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

## Slide 3


> **Notes:** Number Functions
Number functions accept numeric input and return numeric values. This section describes some of the number functions.
Note: This list contains only some of the available number functions.
For more information, see “Number Functions” in Oracle SQL Reference.

## General functions


## nullif(x,y)

- NULLIF is a accepts two arguments and returns a NULL if the two arguments are equal. Otherwise, it returns the first argument.
- It is useful when we need to replace specific values with NULL.
- Suppose we don’t want the user to see SFI as one of the sponsors:
- SELECT sponsor, nullif(sponsor, 'SFI') FROM grant_funding;

## coalesce( )

- Used to handle NULL values in a database query by returning the first non-NULL value from a list of expressions or column values.
- It provides a default or fallback value when NULL values are encountered in the data.
- Suppose you want to retrieve the scientist’s date of birth and replace it with their firstname in case the value is null:
- SELECT coalesce(birth_date::text,firstname) FROM scientist;

## greatest( )

- Returns the greatest value among a list of values.
- Suppose you want to know which one is the most recent: the project end_date or today’s date.
- SELECT research_id, title, GREATEST(end_date, CURRENT_DATE) "Most recent date" FROM research;

## least( )

- Opposite of greatest( ): returns the smallest value among a list of values.
- Suppose you want to know which one is the oldest: the project end_date or today’s date.
- SELECT research_id, title, LEAST(end_date, CURRENT_DATE) "Most recent date" FROM research;

## Number functions


## Number Functions

  - ROUND: Rounds value (up) to specified decimal
  - TRUNC: Truncates value to specified decimal
  - MOD: Returns the remainder of the division

> **Notes:** Number Functions
Number functions accept numeric input and return numeric values. This section describes some of the number functions.
Note: This list contains only some of the available number functions.
For more information, see “Number Functions” in Oracle SQL Reference.

## Number Functions

- --Round
- SELECT grant_id, amount, ROUND(amount, 1) "Rounded amount" FROM grant_funding; --we could also do round(amount)for no decimal number
- We can also use ceil( ) [round up to the nearest integer] and floor( ) [round down to the nearest integer]
- --Ceil, floor and round
- SELECT grant_id, amount, ROUND(amount) "Round", ceil(amount) "Round up", floor(amount) "Round down" FROM grant_funding;

> **Notes:** Number Functions
Number functions accept numeric input and return numeric values. This section describes some of the number functions.
Note: This list contains only some of the available number functions.
For more information, see “Number Functions” in Oracle SQL Reference.

## Using the ROUND Function

- Negative second argument indicates rounding to the left of the decimal point
- Using -1 as the second argument in the function round( ) means you aim to round to the nearest 10s (up or down); using -2, to the nearest 100s; using -3, to the nearest 1000s etc.
- SELECT ROUND(450.9234), ROUND(450.9234,-1)/*nearest 10s*/, ROUND(450.9234,-2)/*nearest 100s*/, ROUND(450.9234,-3)//*nearest 1000s*/;

> **Notes:** ROUND Function
The ROUND function rounds the column, expression, or value to n decimal places. If the second argument is 0 or is missing, the value is rounded to zero decimal places. If the second argument is 2, the value is rounded to two decimal places. Conversely, if the second argument is –2, the value is rounded to two decimal places to the left (rounded to the nearest unit of 10).
The ROUND function can also be used with date functions. You will see examples later in this lesson.
DUAL Table
The DUAL table is owned by the user SYS and can be accessed by all users. It contains one column, DUMMY, and one row with the value X. The DUAL table is useful when you want to return a value once only (for example, the value of a constant, pseudocolumn, or expression that is not derived from a table with user data). The DUAL table is generally used for SELECT clause syntax completeness, because both SELECT and FROM clauses are mandatory, and several calculations do not need to select from actual tables.

## Using the TRUNC Function

- Truncate works similarly, but without rounding the number.
- The decimal numbers are dropped, and the number on the left is truncated to 0 if the argument is -1, to 00 if the argument is -2, etc.
- With negative second argument, TRUNC will make value zero to left of decimal point, so 45 becomes 40
- --Truncate
- SELECT TRUNC(450.923, -1)/*truncate to nearest 10s*/,
- TRUNC(450.923,-2), TRUNC(450.923,-3) /*truncate to nearest 100s*/;

> **Notes:** TRUNC Function
The TRUNC function truncates the column, expression, or value to n decimal places.
The TRUNC function works with arguments similar to those of the ROUND function. If the second argument is 0 or is missing, the value is truncated to zero decimal places. If the second argument is 2, the value is truncated to two decimal places. Conversely, if the second argument is –2, the value is truncated to two decimal places to the left. If the second argument is –1, the value is truncated to one decimal place to the left.
Like the ROUND function, the TRUNC function can be used with date functions.

## Using the TRUNC Function

- In finance, truncate( ) can be useful to discard insignificant decimal places to avoid rounding that could affect the balance, inflating or deflating amounts.
- We can also use it when a system operates on strict thresholds. Suppose an app operates with fixed resource limits on the database – truncating can ensure that the resource count remains within bounds without rounding up.

> **Notes:** TRUNC Function
The TRUNC function truncates the column, expression, or value to n decimal places.
The TRUNC function works with arguments similar to those of the ROUND function. If the second argument is 0 or is missing, the value is truncated to zero decimal places. If the second argument is 2, the value is truncated to two decimal places. Conversely, if the second argument is –2, the value is truncated to two decimal places to the left. If the second argument is –1, the value is truncated to one decimal place to the left.
Like the ROUND function, the TRUNC function can be used with date functions.

## Mod

  - MOD: Returns the remainder of the division.
  - Used for detecting even/odd patterns
  - Helps to categorise based on numerical patterns

> **Notes:** Number Functions
Number functions accept numeric input and return numeric values. This section describes some of the number functions.
Note: This list contains only some of the available number functions.
For more information, see “Number Functions” in Oracle SQL Reference.

## Mod

  - Suppose the university regularly reviews new research projects, and each project must be assigned to one of 3 review committees:
  - Instead of manually distributing projects, you want a quick automatic rule that balances the load evenly among committees.
  - We can use the mod of the research_id to allocate the projects to each committee.

> **Notes:** Number Functions
Number functions accept numeric input and return numeric values. This section describes some of the number functions.
Note: This list contains only some of the available number functions.
For more information, see “Number Functions” in Oracle SQL Reference.

## Mod

- SELECT
- research_id,
- title,
- MOD(research_id, 3) "Assigned committee"
- FROM research r
- ORDER BY 3;

> **Notes:** Number Functions
Number functions accept numeric input and return numeric values. This section describes some of the number functions.
Note: This list contains only some of the available number functions.
For more information, see “Number Functions” in Oracle SQL Reference.

## abs( )

  - The absolute( ) function returns the absolute value of a number, even if it is a negative one.
  - For example, suppose we want to see if there is a difference between the end date of the research project and the end date of the funding. We don’t want any negative values, though.
- --abs( ): Suppose we want to know the difference in days between the end of the research and the end of grant. We do not want negative values, though
- SELECT r.end_date "Research ends", g.end_date "Grant ends", abs(g.end_date - r.end_date) "Days variance" FROM research r JOIN research_grant rg USING (research_id) JOIN grant_funding g USING (grant_id);

> **Notes:** SYSDATE Function
SYSDATE is a date function that returns the current database server date and time. You can use SYSDATE just as you would use any other column name. For example, you can display the current date by selecting SYSDATE from a table. It is customary to select SYSDATE from a dummy table called DUAL. 
Example
Display the current date using the DUAL table.
SELECT SYSDATEFROM   DUAL;

## Working with Dates - formatting

  - The function to_char can be used to display data in a certain format
- SELECT birth_date, to_char(birth_date, 'DD/MM/YYYY') FROM scientist;

> **Notes:** SYSDATE Function
SYSDATE is a date function that returns the current database server date and time. You can use SYSDATE just as you would use any other column name. For example, you can display the current date by selecting SYSDATE from a table. It is customary to select SYSDATE from a dummy table called DUAL. 
Example
Display the current date using the DUAL table.
SELECT SYSDATEFROM   DUAL;

## Working with Dates – current time

- The now( ) function can retrieve the current date and time. It is given as a timestamp data type.
- --current time
- SELECT now();
- SELECT current_date;
- --current time data type
- SELECT pg_typeof(now());

> **Notes:** SYSDATE Function
SYSDATE is a date function that returns the current database server date and time. You can use SYSDATE just as you would use any other column name. For example, you can display the current date by selecting SYSDATE from a table. It is customary to select SYSDATE from a dummy table called DUAL. 
Example
Display the current date using the DUAL table.
SELECT SYSDATEFROM   DUAL;

## Arithmetic with Dates

- Adding seven (7) to a value stored in a date column produces a date that is one week later than the stored date.
- To calculate the duration of a project in weeks, we can divide the number of days by 7.
- --date in a week from now
- SELECT current_date + 7;
- --project duration in weeks
- SELECT (end_date - begin_date) / 7 from research;

> **Notes:** Arithmetic with Dates
Because the database stores dates as numbers, you can perform calculations using arithmetic operators such as addition and subtraction. You can add and subtract number constants as well as dates. 
You can perform the following operations:

## Arithmetic with Dates

- We can also calculate the difference between the current date and a specific value using the function age( )
- --calculate scientist's age
- SELECT age(birth_date) FROM scientist;
- --calculate projects's age
- SELECT age(begin_date) FROM research;

> **Notes:** Arithmetic with Dates
Because the database stores dates as numbers, you can perform calculations using arithmetic operators such as addition and subtraction. You can add and subtract number constants as well as dates. 
You can perform the following operations:

## Conversion Functions


> **Notes:** Conversion Functions
In addition to Oracle data types, columns of tables in an Oracle database can be defined using ANSI, DB2, and SQL/DS data types. However, the Oracle server internally converts such data types to Oracle data types. 
In some cases, the Oracle server uses data of one data type where it expects data of a different data type. When this happens, the Oracle server can automatically convert the data to the expected data type. This data type conversion can be done implicitly by the Oracle server or explicitly by the user.
Implicit data type conversions work according to the rules that are explained in the next two slides.
Explicit data type conversions are done by using the conversion functions. Conversion functions convert a value from one data type to another. Generally, the form of the function names follows the convention data type TO data type. The first data type is the input data type; the second data type is the output.
Note: Although implicit data type conversion is available, it is recommended that you do explicit data type conversion to ensure the reliability of your SQL statements.

## Cast( )

- The function cast(attribute AS data type) is used to convert values into other data types for processing.
- The double colon syntax is a shorthand to cast values.
- SELECT pg_typeof(cast(begin_date AS TEXT)) FROM research;
- SELECT pg_typeof(amount::text) FROM grant_funding;

> **Notes:** Arithmetic with Dates
Because the database stores dates as numbers, you can perform calculations using arithmetic operators such as addition and subtraction. You can add and subtract number constants as well as dates. 
You can perform the following operations:

## Using the TO_CHAR Function with Dates

- In our function, fm stands for fill mode.
- Fill mode removes any leading spaces or padding that would normally be added for certain format elements.
- In our formula, depth is used to format numbers as spelt-out ordinal words with appropriate suffixes (like "st", "nd", "rd", and "th").
- SELECT firstname, TO_CHAR(birth_date, 'Month DDspth') FROM scientist;
- SELECT firstname, TO_CHAR(birth_date, 'fmDD Month YYYY') FROM scientist;

## Date Format of to_char

- Suffixes for numbers:
- TH e.g DDTH would be perhaps 4TH
- SP spelled number DDSP FOUR
- SPTH spelled number plus TH FOURTH

## Using the TO_CHAR Function with Numbers

- These are some of the format elements that you can use with the TO_CHAR function to display a number value as a character:
- TO_CHAR(number, 'format_model') ddspth

> **Notes:** Using the TO_CHAR Function with Numbers
When working with number values such as character strings, you should convert those numbers to the character data type using the TO_CHAR function, which translates a value of NUMBER data type to VARCHAR2 data type. This technique is especially useful with concatenation.

## Using the TO_CHAR Function with Numbers

- --currency sign
- SELECT to_char(amount, '€999,999.99') FROM grant_funding;

> **Notes:** Guidelines
The Oracle server displays a string of number signs (#) in place of a whole number whose digits exceed the number of digits that is provided in the format model.
The Oracle server rounds the stored decimal value to the number of decimal places that is provided in the format model.

## Create your own function Procedure language SQL (PL/pgSQL)


> **Notes:** Guidelines
The Oracle server displays a string of number signs (#) in place of a whole number whose digits exceed the number of digits that is provided in the format model.
The Oracle server rounds the stored decimal value to the number of decimal places that is provided in the format model.

## Slide 30

- PL/pgSQL (Procedural Language/PostgreSQL) functions allow you to write reusable, modular blocks of code that can perform complex operations not easily achieved with a simple query.
- PL/pgSQL functions extend SQL by allowing control structures such as loops and conditional statements.
- PL/pgSQL functions are often used as triggers, where a function is executed automatically in response to certain events on a table (like INSERT, UPDATE, or DELETE).

> **Notes:** Guidelines
The Oracle server displays a string of number signs (#) in place of a whole number whose digits exceed the number of digits that is provided in the format model.
The Oracle server rounds the stored decimal value to the number of decimal places that is provided in the format model.

## Syntax

- CREATE OR REPLACE FUNCTION function_name(parameter_name data_type)
- RETURNS return_type AS $$
- BEGIN
- RETURN something;
- END;
- $$ LANGUAGE plpgsql;

> **Notes:** Guidelines
The Oracle server displays a string of number signs (#) in place of a whole number whose digits exceed the number of digits that is provided in the format model.
The Oracle server rounds the stored decimal value to the number of decimal places that is provided in the format model.

## Slide 32

- --PL/SQL
- CREATE OR REPLACE FUNCTION get_project_status(begin_d DATE, end_d DATE)
- RETURNS TEXT AS $$
- BEGIN
- IF current_date BETWEEN begin_d AND end_d THEN
- RETURN 'Active';
- ELSEIF current_date < begin_d THEN
- RETURN 'Upcoming';
- ELSE
- RETURN 'Completed';
- END IF;
- END;
- $$ LANGUAGE plpgsql;
- SELECT research_id, title,
- get_project_status(begin_date, end_date) AS project_status
- FROM research
- LIMIT 5;

> **Notes:** Guidelines
The Oracle server displays a string of number signs (#) in place of a whole number whose digits exceed the number of digits that is provided in the format model.
The Oracle server rounds the stored decimal value to the number of decimal places that is provided in the format model.

## Slide 33


> **Notes:** Guidelines
The Oracle server displays a string of number signs (#) in place of a whole number whose digits exceed the number of digits that is provided in the format model.
The Oracle server rounds the stored decimal value to the number of decimal places that is provided in the format model.
