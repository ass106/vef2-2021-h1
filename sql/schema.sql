DROP TABLE IF EXISTS SerieToGenre CASCADE;
DROP TABLE IF EXISTS SerieToUser CASCADE;
DROP TABLE IF EXISTS Episodes CASCADE;
DROP TABLE IF EXISTS Seasons CASCADE;
DROP TABLE IF EXISTS Genres CASCADE;
DROP TABLE IF EXISTS Series CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

CREATE TABLE IF NOT EXISTS Series(
    id serial PRIMARY KEY,
    name varchar(128) NOT NULL,
    airDate date NOT NULL,
    inProduction boolean,
    tagline varchar(128),
    image varchar(256) NOT NULL,
    description text,
    language varchar(5),
    network varchar(128) NOT NULL,
    url varchar(256)
);

CREATE TABLE IF NOT EXISTS Genres(
    id serial PRIMARY KEY,
    name varchar(128) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS SerieToGenre(
    id serial PRIMARY KEY,
    serieId int,
    genreId int,
    FOREIGN KEY (serieId) REFERENCES Series(id) ON DELETE CASCADE,
    FOREIGN KEY (genreId) REFERENCES Genres(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Seasons(
    id serial PRIMARY KEY,
    name varchar(128) NOT NULL,
    "number" integer,
    CHECK("number" > 0),
    airdate timestamp,
    overview text,
    poster varchar(256) NOT NULL,
    serieId int,
    FOREIGN KEY (serieId) REFERENCES Series(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Episodes(
    id serial PRIMARY KEY,
    serieId int,
    seasonNumber integer,
    name varchar(128) NOT NULL,
    "number" integer,
    CHECK("number" > 0),
    airDate varchar(128),
    overview text,
    FOREIGN KEY (serieId) REFERENCES Series(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Users(
    id serial PRIMARY KEY,
    name varchar(128) NOT NULL UNIQUE,
    email varchar(128) NOT NULL UNIQUE,
    password varchar(128) NOT NULL,
    admin boolean DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS SerieToUser(
    serieId int,
    userId int,
    status int,
    grade int,
    FOREIGN KEY (serieId) REFERENCES Series(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);