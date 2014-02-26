DROP TABLE IF EXISTS deck CASCADE;
DROP TABLE IF EXISTS slide CASCADE;
DROP TABLE IF EXISTS snap CASCADE;
DROP TABLE IF EXISTS snap_slide CASCADE;

CREATE TABLE deck (
    id SERIAL PRIMARY KEY,
    name VARCHAR(25)
);


CREATE TABLE slide (
    id SERIAL PRIMARY KEY,
    num int NOT NULL,
    deck_id INT REFERENCES deck(id) NOT NULL,
    data_path VARCHAR(255) -- image data is stored on disk
);


CREATE TABLE snap (
    id SERIAL PRIMARY KEY,
    name VARCHAR(25),
    deck_id INT REFERENCES deck(id) NOT NULL
);


CREATE TABLE snap_slide (
    id SERIAL PRIMARY KEY,
    snap_id INT REFERENCES snap(id) NOT NULL,
    slide_id INT REFERENCES slide(id) NOT NULL,
    seen BOOLEAN DEFAULT FALSE NOT NULL
);
