CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL
);

-- Insert data
INSERT INTO users (username, password) VALUES
('admin', 'admin123'),
('MarySmith', 'dublin123'),
('JohnDoe', 'kildare456');

-- Vulnerable Method
DO $$
DECLARE
    user_input_username TEXT := 'JohnDoe';
    user_input_password TEXT := ''' OR 1=1; --';  -- Malicious input
    query TEXT;
    result INT;
BEGIN
    -- Vulnerable query with string concatenation
    --query becomes: SELECT COUNT(*) FROM users WHERE username = 'JohnDoe' AND password = '' OR 1=1; --';

    query := 'SELECT * FROM users WHERE username = ''' || user_input_username || ''' AND password = ''' || user_input_password || '''';
    EXECUTE query INTO result;

    -- Output the result
    IF result > 0 THEN
        RAISE NOTICE 'Authentication successful!';
    ELSE
        RAISE NOTICE 'Authentication failed!';
    END IF;
END;
$$;


-- Secure Method
DO $$
DECLARE
    user_input_username TEXT := 'JohnDoe';
    user_input_password TEXT := ''' OR 1=1; --';  -- Correct password
    result INT;
BEGIN
    -- Secure query using placeholders and parameters
    EXECUTE 'SELECT * FROM users WHERE username = $1 AND password = $2'
    INTO result
    USING user_input_username, user_input_password;

    -- Output the result
    IF result > 0 THEN
        RAISE NOTICE 'Authentication successful!';
    ELSE
        RAISE NOTICE 'Authentication failed!';
    END IF;
END;
$$;