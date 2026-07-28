# Week 8 - Security, views and CTE


## Security, views and CTEsDr Mariana RochaSchool of Computer Science

- CPMU 2007 Databases 1, Lecture 8

## Learning outcomes

- Understand why database security is essential in a relational database system.
- Understand how security and integrity controls are implemented in PostgreSQL.
- Evaluate how views and common table expressions (CTEs) can support secure, efficient, and modular query design.

## Why database security is essential

- Database security protects the organisation’s most valuable asset: its data.
- Losing or corrupting data can lead to financial losses, reputational damage, or even legal action.
- Security ensures that data is accessed only by authorized users and remains accurate and available.
- We often describe this using the CIA Triad: Confidentiality, Integrity, and Availability.

## CIA Triad

- Confidentiality: Only authorised users should see the data. For example, a student database should not allow other students to see personal details.
- Integrity: Data must remain accurate and consistent. For example, we must prevent duplicate IDs or negative salaries.
- Availability: Authorised users must access data when needed. For example, databases must recover quickly after a crash.

## Common threats to databases

- Databases face many security risks:
- Unauthorised access or privilege misuse.
- SQL injection attacks.
- Accidental data deletion or corruption.
- Loss of availability due to hardware failure or ransomware.
- Therefore, every database must include preventive and recovery measures.

## SQL injections

- SQL Injection is a common web security vulnerability where an attacker manipulates SQL queries by injecting malicious input.
- Attackers gain unauthorised access to the database, being able to retrieve, modify, or delete sensitive data.
- SQL Injection commonly occurs when user input is directly embedded in SQL queries without proper sanitisation, allowing attackers to execute arbitrary SQL commands.

## SQL injections

- The following example is prone to SQL injection:
- The attacker can log in as any user without the need for a password by adding the comment sequence (--) to remove the password check from the WHERE clause of the query.
- For example, submitting the username admin-- and a blank password results in the following query:
- This query returns the data from user whose username is admin and successfully logs the attacker in as that user.
- SELECT * FROM users WHERE username = ''' || user_input_username || ''' AND password = ''' || user_input_password || ''';
- SELECT * FROM users WHERE username = 'admin'--' AND password = ''

## SQL injections – safe query

- This query is secure because it is parameterised -- it uses placeholders instead of directly concatenating user input into the query.
- The user_input_name and user_input_password variables are directly passed to the WHERE clause. PostgreSQL treats these variables as data, not as part of the SQL syntax.
- The query is pre-parsed by PostgreSQL, and variables are substituted securely.
- BEGIN
- -- Secure query using placeholders and parameters
- EXECUTE 'SELECT * FROM users WHERE username = $1 AND password = $2'
- INTO result
- USING user_input_username, user_input_password;
- -- Output the result
- IF result > 0 THEN
- RAISE NOTICE 'Authentication successful!';
- ELSE
- RAISE NOTICE 'Authentication failed!';
- END IF;

## SQL injections – vulnerable query

- Check the sql_injection.sql example

## SQL Injections

- Access the following website to simulate an SQL injection:
- https://www.hacksplaining.com/lessons/sql-injection/start

## Legal and regulatory obligations

- In Europe, database systems must comply with:
  - GDPR (2018) – requires data protection, consent, and breach notification.
  - Data Protection Act (2018) – enforces how personal data is stored and processed.
  - Database administrators are legally responsible for ensuring compliance, logging, and auditability.

## Security in a DBMS

- Security mechanisms are built into all relational database management systems. These include:
  - Authentication (checking user identity)
  - Authorisation and access control
  - Integrity constraints
  - Views
  - Backup and recovery
  - Encryption and auditing
- PostgreSQL supports all these through SQL commands and configuration files.

## Authentication

- Authentication verifies who is trying to connect.
- PostgreSQL supports:
  - Password-based login (default)
  - Peer authentication (local OS user)
  - Enterprise-level authentication systems that work as servers holding people’s details.
- Example:
- This creates a new user role with login privileges.
- CREATE ROLE mariana LOGIN PASSWORD 'StrongPass!';

## Authentication – access control

- Authorization defines what an authenticated user can do.
- Privileges include: SELECT, INSERT, UPDATE, DELETE, REFERENCES, etc.
- Example:
- This gives Mariana permission to read and add records, but not delete them.
- GRANT SELECT, INSERT ON employees TO mariana;
- REVOKE DELETE ON employees FROM mariana;

## Roles and privileges

- Roles can represent individuals or groups.
- You can create a role, assign privileges, and grant that role to multiple users:
- Mariana now inherits all privileges from the manager role.
- CREATE ROLE manager;
- GRANT SELECT, UPDATE ON employees TO manager;
- GRANT manager TO mariana;

## Integrity constraints

- Integrity controls ensure data remains valid.
- PostgreSQL uses:
  - PRIMARY KEY – enforces unique identification.
  - FOREIGN KEY – maintains referential integrity.
  - CHECK – ensures logical conditions are met.
  - NOT NULL – prevents missing values.

## Encryption

- PostgreSQL has also a module named pgcrypto that protects data stored in the database itself, protecting data at rest.
- Secure Sockets Layer (SSL connections) encrypts all data sent across the network: the password, the queries, and the data returned. This protects the data in transit.

## Slide 18

- -- Enable the pgcrypto extension (run once per database)
- CREATE EXTENSION IF NOT EXISTS pgcrypto;
- -- demo table
- DROP TABLE IF EXISTS secure_customers;
- CREATE TABLE secure_customers (
- id SERIAL PRIMARY KEY,
- full_name TEXT NOT NULL,
- national_id BYTEA -- this column will store encrypted data, BYTEA stores arbitrary strings
- );
- INSERT INTO secure_customers (full_name, national_id)
- VALUES ('Alice Murphy', convert_to('123456789', 'UTF8')); --making sure the value is converted into bytea
- -- View the plain text
- SELECT id, full_name, convert_from(national_id, 'UTF8') AS national_id_plain
- FROM secure_customers;
- -- Encrypt the data using a symmetric key
- UPDATE secure_customers
- SET national_id = pgp_sym_encrypt('123456789', 'mysecretkey123') --this function takes the data and a key to encrypt, the same key is used to decrypt
- WHERE full_name = 'Alice Murphy';
- SELECT id, full_name, national_id FROM secure_customers;

## Backup and recovery

- A backup is a copy of your database data and structure that can be restored if something goes wrong.
- Without backups, you risk permanent data loss from:
  - Hardware failures
  - Accidental DROP TABLE or DELETE
  - Software corruption
  - Ransomware or malicious attacks

## Backup and recovery

- If we want to create a backup of the football database, we can fun the following in the terminal:
- pg_dump -h localhost -p 54321 -U postgres -d postgres -n football -v -f football_backup.sql
- ls -lh football_backup.sql

## Views for security

- A database view is a logical or virtual table based on a query.
- It is useful to think of a view as a stored query.
- It helps to avoid writing the same query over and over agai
- Useful ways of presenting different information to different users.

## Views for security

- The view is called a virtual table. It does not store a table physically --  instead, it represents a complex query, avoiding the need to rewrite it many times.
- Think about the complex JOINS we have encountered before. If you need to write those joins many times, instead of copying and pasting the code, you can create and recall a view
- Views can also be helpful in complying with specific needs of specific users

## Views for different roles

- Considering the football database, we can have different people accessing the same data with different needs.
- We can protect our data and make the access easier by creating roles and views:
- -- Example roles
- CREATE ROLE analyst NOLOGIN;
- CREATE ROLE hr_payroll NOLOGIN;
- CREATE ROLE coach NOLOGIN;
- CREATE ROLE public_web NOLOGIN;

## Public rosters

- Consider basic data about the players that anyone can see: name, nationality, preferred_foot and club
- We can create a view and associate it with specific roles, so they can see that data when they login.
- CREATE OR REPLACE VIEW view_public_rosters AS
- SELECT
- p.player_id,
- p.player_name,
- p.nationality,
- p.preferred_foot,
- c.club_name
- FROM football.players p
- JOIN football.player_contracts pc USING (player_id)
- JOIN football.clubs c USING (club_id)
- --grant to specific roles
- GRANT SELECT ON v_public_rosters TO public_web, analyst, coach;

## HR and Payroll

- Some users might need to know how much money the players make and other info on their contracts.
- CREATE OR REPLACE VIEW v_hr_contracts AS
- SELECT
- pc.player_contract_id,
- pc.player_id,
- pc.club_id,
- pc.joined,
- pc.contract_valid_until,
- pc.jersey_number,
- pc.value,
- pc.wage,
- pc.release_clause
- FROM football.player_contracts pc;
- GRANT SELECT, INSERT, UPDATE, DELETE ON v_hr_contracts TO hr_payroll;

## Coach and analyst

- The coach and the analyst might need to know details about the players, but nothing about their salaries.
- CREATE OR REPLACE VIEW v_coach_scout AS
- SELECT
- p.player_id,
- p.player_name,
- p.age,
- p.nationality,
- pa.overall,
- pa.potential,
- pa."position",
- pa.preferred_foot,
- pa.body_type
- FROM football.players p
- LEFT JOIN football.player_attributes pa USING (player_id);
- GRANT SELECT ON football.v_coach_scout TO coach, analyst;

## Changing data through view

- Even though the view is not the physical table, just a virtual version of it, we still can use it to insert and delete data from the original table.
- This is done using an insert or update statements on the view
- Doing this through a view makes the process more secure and simple to the user.

## Update through views

- When we created a view to HR, we granted the possibility of updating the data through the view.
- UPDATE v_hr_contracts
- SET wage = 14000
- WHERE player_id = 999999
- AND club_id = 'CL4';

## Can I always update through a view?

- Even though updating data through a view can be handy, PostgreSQL does not always allow that.
- This is a security measure. Consider that views are often used by other users, mainly non-developers, and might combine multiple tables and attributes to allow the user to retrieve the information required.
- However, for more complex views (involving joins, for example), users might try to insert duplicated or incorrect data, damaging the integrity of the database.

## Can I always update through a view?

- You can only insert, delete and update views that:
  - Are based on one single base table (not a join).
  - Don’t use aggregates, DISTINCT, GROUP BY, HAVING, UNION, or set operations.
  - Include all mandatory (NOT NULL) columns from the base table, or those have defaults.

## Views: pros and cons

