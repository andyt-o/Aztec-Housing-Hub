CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    red_id VARCHAR(9) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    bio TEXT,
    cleanliness VARCHAR(50),
    sleep_schedule VARCHAR(50),
    roommate_status VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS listings (
    id BIGINT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    availability TEXT,
    type VARCHAR(100) NOT NULL,
    placement VARCHAR(50) NOT NULL,
    area VARCHAR(255),
    beds INTEGER,
    baths INTEGER,
    price INTEGER,
    distance FLOAT,
    owner_email VARCHAR(255),
    roommate_status VARCHAR(50),
    clicks INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS listing_click_history (
    id SERIAL PRIMARY KEY,
    listing_id BIGINT REFERENCES listings(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    count INTEGER NOT NULL,
    UNIQUE(listing_id, date)
);

CREATE TABLE IF NOT EXISTS zipcodes (
    zip VARCHAR(10) PRIMARY KEY,
    city VARCHAR(255) NOT NULL
);