CREATE TABLE channels (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    channel_id INTEGER REFERENCES channels,
    name VARCHAR NOT NULL,
    time VARCHAR NOT NULL,
    content VARCHAR NOT NULL,
);