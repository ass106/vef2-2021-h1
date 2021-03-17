
-- Gott að hafa inni þegar við erum hugsanlega að henda og búa til aftur og aftur
DROP TABLE IF EXISTS tvshows;
DROP TABLE IF EXISTS tvgenres;
DROP TABLE IF EXISTS tvrelations;
DROP TABLE IF EXISTS tvseasons;
DROP TABLE IF EXISTS episodes;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS tvusersrelations;

/* Sjónvarpsþáttur */
CREATE TABLE IF NOT EXISTS series(
    id serial primary key,
    name varchar(128) not null,/* Nafn, strengur, ekki tómt */
    airDate timestamp with time zone,/* Fyrst sjónvarpað, dagsetning, má vera tóm */
    inProduction boolean not null default true, /* Í framleiðslu?, boolean */
    tagline varchar(128), /* „Tagline“, strengur, má vera tóm */
    image varchar(128) not null, /* Mynd, vísun í slóð, ekki tóm */
    description varchar(max), /* Lýsing, strengur, má vera tóm */
    language varchar(25), /* Tungumál, strengur (tæknilega ISO 639-1 kóði fyrir tungumál), krafa en ekki þarf að staðfesta að gildi sé ISO 639-1 */
    network varchar(128), /* Sjónvarpsstöð (e. network), strengur */
    url varchar(128) /* Vefsíða, strengur (url), má vera tómt */
);

/* Sjónvarpsþátta genre */
CREATE TABLE IF NOT EXISTS genre(
    name varchar(128) UNIQUE not null/* Nafn, strengur, ekki tómt */
);

/* Tengitafla series og genre*/
CREATE TABLE IF NOT EXISTS seriesgenre(
    series series, /* Vísun í sjónvarpsþátt */
    genre genre /* Vísun í sjónvarpsþáttategund */
);

CREATE TABLE IF NOT EXISTS season(
    id serial primary key,
    name varchar(128) not null, /* Nafn, strengur, ekki tómt */
    number integer /* Númer, heiltala, stærri en 0, krafa */
    /* Fyrst sjónvarpað, dagsetning, má vera tóm */
    /* Lýsing, strengur, má vera tóm */
    /* Poster, vísun í slóð, ekki tóm */
    /* Vísun í sjónvarpsþátt */
);

CREATE TABLE IF NOT EXISTS episode(
    id serial primary key,
    /* Nafn, strengur, ekki tómt */
    /* Númer, heiltala, stærri en 0, krafa */
    /* Fyrst sjónvarpað, dagsetning, má vera tóm */
    /* Lýsing, strengur, má vera tóm */
    /* Vísun í season */ 
);

CREATE TABLE IF NOT EXISTS users(
    id serial primary key,
    username varchar(128) UNIQUE not null, /* Notendanafn, einstakt, krafist */
    email varchar(128) UNIQUE not null, /* Netfang, einstakt, krafist */
    password varchar(1280) not null,/* Lykilorð, krafist, a.m.k. 10 stafir, geymt sem hash úr bcrypt */
    admin boolean default false/* Stjórnandi, boolean, sjálfgefið false */
);

CREATE TABLE IF NOT EXISTS userseries(
    /* Vísun í sjónvarpsþátt */
    /* Vísun í notanda */
    /* Staða, má vera tóm, eitt af Langar að horfa, Er að horfa, Hef horft (hægt að nota strengi eða enum) */
    /* Einkunn, má vera tóm, heiltala, 0, 1, 2, 3, 4, 5 */
);

INSERT INTO users (username, password) VALUES ('admin', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');