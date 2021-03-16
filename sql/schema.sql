
-- Gott að hafa inni þegar við erum hugsanlega að henda og búa til aftur og aftur
DROP TABLE IF EXISTS tvshows;
DROP TABLE IF EXISTS tvgenres;
DROP TABLE IF EXISTS tvrelations;
DROP TABLE IF EXISTS tvseasons;
DROP TABLE IF EXISTS episodes;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS tvusersrelations;

CREATE TABLE IF NOT EXISTS tvshows(
    /* Nafn, strengur, ekki tómt */
    /* Fyrst sjónvarpað, dagsetning, má vera tóm */
    /* Í framleiðslu?, boolean */
    /* „Tagline“, strengur, má vera tóm */
    /* Mynd, vísun í slóð, ekki tóm */
    /* Lýsing, strengur, má vera tóm */
    /* Tungumál, strengur (tæknilega ISO 639-1 kóði fyrir tungumál), krafa en ekki þarf að staðfesta að gildi sé ISO 639-1 */
    /* Sjónvarpsstöð (e. network), strengur */
    /* Vefsíða, strengur (url), má vera tómt */
  
);

CREATE TABLE IF NOT EXISTS tvgenres(
    /* Nafn, strengur, ekki tómt */
);

CREATE TABLE IF NOT EXISTS tvrelations(
    /* Vísun í sjónvarpsþátt */
    /* Vísun í sjónvarpsþáttategund */
);

CREATE TABLE IF NOT EXISTS tvseasons(
    /* Nafn, strengur, ekki tómt */
    /* Númer, heiltala, stærri en 0, krafa */
    /* Fyrst sjónvarpað, dagsetning, má vera tóm */
    /* Lýsing, strengur, má vera tóm */
    /* Poster, vísun í slóð, ekki tóm */
    /* Vísun í sjónvarpsþátt */
);

CREATE TABLE IF NOT EXISTS episodes(
    /* Nafn, strengur, ekki tómt */
    /* Númer, heiltala, stærri en 0, krafa */
    /* Fyrst sjónvarpað, dagsetning, má vera tóm */
    /* Lýsing, strengur, má vera tóm */
    /* Vísun í season */
);

CREATE TABLE IF NOT EXISTS users(
    /* Notendanafn, einstakt, krafist */
    /* Netfang, einstakt, krafist */
    /* Lykilorð, krafist, a.m.k. 10 stafir, geymt sem hash úr bcrypt */
    /* Stjórnandi, boolean, sjálfgefið false */
);

CREATE TABLE IF NOT EXISTS tvusersrelations(
    /* Vísun í sjónvarpsþátt */
    /* Vísun í notanda */
    /* Staða, má vera tóm, eitt af Langar að horfa, Er að horfa, Hef horft (hægt að nota strengi eða enum) */
    /* Einkunn, má vera tóm, heiltala, 0, 1, 2, 3, 4, 5 */
);

INSERT INTO users (username, password) VALUES ('admin', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii');