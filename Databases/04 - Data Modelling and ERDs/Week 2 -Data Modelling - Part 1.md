# Week 2 -Data Modelling - Part 1


## Data modelling – Part 1Dr Mariana RochaSchool of Computer Science

- CMPU 2007 Databases 1, Lecture 2

## Models - Purpose

- The objective of data modelling is to produce a model that:
  - can be understood by an end user,
  - contains sufficient detail for a developer to build a physical database.

## Data Models


> **Notes:** Data Models
Models are a cornerstone of design. Engineers build a model of a car to work out any details before putting it into production. In the same manner, system designers develop models to explore ideas and improve the understanding of database design.

## The Entity-Relationship Model

- Relational databases use ERD models to represent the database considering:
  - Entities involved (things about which data is to be stored)
  - Relationships (or associations) among those entities and
  - Attributes (properties) of both the entities and their relationships

## ERD

- Used to define the structure of entities and the pattern of relationships between them.
- When we implement that structure and pattern in a physical database, then we can populate it with data about the entity.
- The ERD is implementation-independent
  - You can implement the same conceptual model in any relational database (PostgreSQL, Oracle etc.)
  - There may be small implementation differences (for example, data types), but the structure and relationships will be the same.

## ERD - entities

- The entities in a relational database are the tables.
- There are two types of entities:
  - Strong entities: exist independently
  - Weak entities: depend on another entity

## ERD – Strong entity (transaction)


## ERD – Weak entity (transaction)


## Step 1: Find the entities

- Discover the entities about which you need to store data
  - Conduct Interviews and Document analysis
  - Ask what things they would like to capture, store, produce information about
  - Study forms, files, reports
  - Identify key words
  - Some identify event entities e.g. orders, payments etc.
  - Look for relationships between things
- Find the pieces of data required and then group them into entities
- Give entities meaningful names
  - Name with NOUNS
  - Define them in business terms

## Example

- Local county councils organise football competitions for school children.
  - Each local county council has a unique identifier and a name.
- Competitions are held on different dates for different age groups with fees and prizes.
  - Each competition has a unique ID and a name.
- There are lots of teams who compete.
  - Each team has a unique identifier,  a name and an age group.
- What are the entities?

## Step 2: Allocate the attributes to entities

- For each entity
  - Identify its attributes
  - Decide on a name for each (starting with lowercase)
  - Identify the correct data type and size required for each

## Data types Logical

- These are different to the physical datatypes
  - Characters or character strings (CHAR, VARCHAR)
  - Numeric Data
  - Data and time
  - Binary
- Each attribute can only be of one data type
- At design stage, you need to clearly identify the data type
  - It will then be translated into the correct datatype in the relational model so that it can be correctly implemented in a physical database when it is built from the design

## Our Example

- Local county councils organise football competitions for school children.
  - Each local county council has a unique identifier and a name.
- Competitions are held on different dates for different age groups with fees and prizes.
  - Each competition has a unique ID and a name.
- There are lots of teams who compete.
  - Each team has an ID, a name and an age group.
- What are the attributes and their datatypes?

## Our Example – What are the datatypes?

- Each council has
  - a unique ID (INT)
  - a name VARCHAR (40)
- Each team has
  - a unique numeric ID INT
  - a name VARCHAR (40)
  - an age group INT
- Each competition has
  - a unique ID (INT)
  - a name VARCHAR (40)
  - an entrance fee (which could store values up to 999.99) NUMERIC Precision 5, scale 2
  - a prize (which could store values up to 9999.99)
  - NUMERIC Precision 6, scale 2
  - the date on which the competition will happen (DATE)

## Step 3: Entity Constraints

- Identify relevant value constraints on the attributes we can define at this stage
- Constraints are rules that the data must follow to belong to a given entity.
- Constraints are rules that the data must follow to be removed from a given entity.
- Constraints enforce rules.
- Ensures that whoever uses your data can be confident that the data will be consistent.

## Constraints

- ENTITY Integrity
  - Primary Key
- REFERENTIAL Integrity
  - Foreign Key
- DOMAIN Integrity
  - Datatype
  - Value Constraints
    - Define
      - if NULL values are disallowed
      - if UNIQUE values are required
      - and if only a certain set of values is allowed in a column.

## NULL and NOT NULL

- What is NULL?
  - Null is a non-value
  - It is not zero, it is not blank
- NULL is a special name to denote a valueless column in a row.
- If the column must contain a non-null value, the constraint ‘NOT NULL’ should be put on it.
- This will prevent a user from adding a row that has no value for this column
- The default is NULL. Unless you specify NOT NULL, nulls will be allowed.

## Our Example – Entity Integrity

- Each council must have
  - a unique numeric ID (INT)
- Each competition must have
  - a unique numeric ID (INT)
- Each team must have
  - a unique numeric ID (INT)

## Key Constraints – Primary Key

- For each entity
  - Identify which attribute will uniquely identify it. Three rules should be considered:
    - Value of key should not change over lifetime of entity
    - Value of key cannot be null
    - Value must be unique
  - Possibilities:
      - Reuse attributes
      - Invent a key
      - Combine a number of attributes

## Key Constraints – Primary Key

- Is an attribute or a set of attributes that uniquely identify a specific instance of an entity.
- Every entity in the data model must have a primary key whose values uniquely identify instances of the entity.
- Enforce entity integrity by uniquely identifying entity instances.

## Key Constraints – Primary Key

- Sometimes an entity will have more than one attribute that can serve as a primary key.
- Any key or minimum set of keys that could be a primary key is called a candidate key.
- Once candidate keys are identified, choose one, and only one, primary key for each entity.
  - Choose the identifier most commonly used by the user as long as it conforms to the properties required of a primary key.
- Candidate keys which are not chosen as the primary key are known as alternate keys.

## Step 4: Define the Relationships

- A relationship is a link or an association between two entities which is meaningful for the organisation
  - For example, a Customer ‘places’ an Order
- A relationship is a natural business association that exists between one or more entities.
- Relationships can represent an event or a logical affinity
- Relationships usually arise because of
  - association - a Customer ‘places’ an Order
  - structure - an Order ‘consists’ of Order-Lines
- All relationships that are usable only involve two entities.

## Slide 23

- We relate entities to each other in quantitative terms (Cardinality).
- The relationship is defined by the number of rows in one table that are related to the number of rows in another table.
- All relationships are bi-directional, so cardinality must be defined in both directions for every relationship.
- Also called complexity or degree of the relationship.
- Examples
  - A customer places one or more orders
  - An order is placed by one
  - An order consists of one or more products
  - A product appears on zero, one or more orders
  - A student enrols on one or more modules

> **Notes:** Bold, underlined verb phrases define business relationships between two entities

## Slide 24


> **Notes:** Entities don’t exist in isolation. The things they represent interact with and impact one another to support business mission so we introduce the concept of a relationship

## Step 4: Define the relationships

- Define the type and optionality of each relationship
  - How many instances of each entity are involved?
  - Does the relationship have to exist for all instances?
- Define the Cardinality/Complexity/Degree of relationships
  - Need to ask questions about the relationship
    - Must a customer exist for every order?
    - Must an order exist for every customer?
    - Must an order always include a product?
    - How many products can an order include?
    - Must a product appear on an order?

> **Notes:** Entities don’t exist in isolation. The things they represent interact with and impact one another to support business mission so we introduce the concept of a relationship

## One-to-one (1:1)

- In a one-to-one relationship, a single record in Table A is associated with a single record in Table B, and vice versa. This means that for every instance of Table A, there is exactly one corresponding instance in Table B.
- Notation: Typically represented by a line connecting the two entities, with a "1" at both ends.
- For example, a person has one passport, and each passport belongs to one person.

> **Notes:** Entities don’t exist in isolation. The things they represent interact with and impact one another to support business mission so we introduce the concept of a relationship

## One-to-many (1:N)

- In a one-to-many relationship, a single record in Table A can be associated with multiple records in Table B. Still, a record in Table B can only relate to one record in Table A.
- Notation: Represented by a line connecting the two entities, with a "1" at the Table A end and an "N" (or "M") at the Table B end.
- A library can have many books, but each book belongs to only one library.

> **Notes:** Entities don’t exist in isolation. The things they represent interact with and impact one another to support business mission so we introduce the concept of a relationship

## Many-to-one (M:1)

- This is essentially the reverse of a one-to-many relationship. Many records in Table B can relate back to a single record in Table A, but a record in Table A can relate to many records in Table B.
- Notation: Represented similarly to the one-to-many notation, with an "N" (or "M") at the Table B end and a "1" at the Table A end.
- Many students can belong to one classroom.

> **Notes:** Entities don’t exist in isolation. The things they represent interact with and impact one another to support business mission so we introduce the concept of a relationship

## Many-to-many (M:N)

- In a many-to-many relationship, multiple records in Table A can relate to multiple records in Table B, and vice versa. This relationship usually requires a junction table to facilitate the connection.
- Notation: Represented by a line connecting the two entities, with an "M" (or "N") at both ends.
- Students can enrol in multiple courses, and each course can have multiple students enrolled.

> **Notes:** Entities don’t exist in isolation. The things they represent interact with and impact one another to support business mission so we introduce the concept of a relationship

## Resolving Many-to-many

- Many-to-many relationships are prone to error as managing a large number of rows that relates to another large number of rows can be challenging
- We resolve many-to-many relationships by introducing a junction table, also known as a weak entity.

> **Notes:** Entities don’t exist in isolation. The things they represent interact with and impact one another to support business mission so we introduce the concept of a relationship

## Step 4: Define the relationships


> **Notes:** Entities don’t exist in isolation. The things they represent interact with and impact one another to support business mission so we introduce the concept of a relationship

## Foreign Key

- When one table needs to be related to another table, you must include a common attribute(s).
- The common attribute(s) will be the primary key in one table and the foreign key in another table.
- Foreign keys enforce referential integrity – the values should be the same in both tables for that specific attribute.

## Foreign Key

- A foreign key value must match an existing value in the parent table or be NULL.
- Foreign keys are based on data values and are purely logical, rather than physical, pointers.

## Our example


## Parent and Child entities

- Parent entity
  - An entity that contributes one or more attributes to another entity, called the parent.
  - In a one-to-many relationship the parent is the entity on the "one" side.
- Child entity
  - An entity that derives one or more attributes from another entity, called the child.
  - In a one-to-many relationship the child is the entity on the "many" side.

> **Notes:** Teaching Notes
These concepts are illustrated on the next slide.

## Data Modeling: One to one in pgadmin

- Pgadmin is an open-source, free database management system that allows us to build ERDs using forward engineering
- However, pgadmin considers one-to-one relationships a special case of one-to-many relationships
- There is no representation of one to one in the pgadmin notation
- We can work around that by making the FK on the table at the many side a UNIQUE value
- For example: build an ERD for two tables that include information about employees and company_cars, considering that each employee can have only one car assigned to them.

> **Notes:** Teaching Notes
These concepts are illustrated on the next slide.

## Slide 37

