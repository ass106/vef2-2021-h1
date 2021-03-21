/**
 * db.js
 * Functions related to the database. Fetching, deleting and updating tables.
 */
import { query } from './utils.js';

export async function getAllFromTable(table, offset = 0, limit = 10) {
  const q = `SELECT * FROM ${table} OFFSET ${offset} LIMIT ${limit};`;
  let result = '';
  try {
    result = await query(q);
  } catch (e) {
    console.info('Error occured in getAllFromTable >> ', e);
  }
  return result.rows;
}

export async function getSerieById(id, userId = false, offset = 0, limit = 10) {
  const serieQuery = 'SELECT * FROM Series s WHERE id = $1;';
  const ratingQuery = 'SELECT COUNT(*), AVG(grade) FROM SerieToUser WHERE serieId = $1;'
  const genreQuery = 'SELECT name FROM SerieToGenre JOIN Genres ON genreId = Genres.id WHERE serieId = $1;';
  const seasonQuery = 'SELECT * FROM Seasons WHERE serieId = $1;';
  
  try {
    const serieResult = await query(serieQuery, [id]);
    const ratingResult = await query(ratingQuery, [id]);
    const genreResult = await query(genreQuery, [id]);
    const seasonResult = await query(seasonQuery, [id]);
    let userResult;
    if(userId) {
      const userQuery = 'SELECT grade, status from SerieToUser WHERE serieId = $1 AND userId = $2;';
      userResult = await query(userQuery, [id,userId]);
    }
    else userResult = {rows: 'User not logged in'};

    if (serieResult.rowCount === 1) {
      return {
        info: serieResult.rows[0],
        user: userResult.rows,
        ratings: ratingResult.rows[0],
        genres: genreResult.rows,
        seasons: seasonResult.rows
      }
    }
  } catch (e) {
    console.info('Error occured in getSerieById >> ', e);
  }
  return false;
}

export async function getSeasonsBySerieId(serieId, offset = 0, limit = 10) {
  const q = 'SELECT * FROM Seasons WHERE serieId = $1 OFFSET $2 LIMIT $3;';
  let result = '';
  try {
    result = await query(q, [serieId, offset, limit]);
  } catch (e) {
    console.info('Error occured in getSeasonsBySerieId >> ', e);
  }
  return result.rows;
}

export async function getSeasonBySerieIdAndSeasonNum(serieId, seasonNum) {
  const q = 'SELECT * FROM Seasons WHERE number = $1 and serieId = $2;';
  let result = '';
  try {
    result = await query(q, [seasonNum, serieId]);
  } catch (e) {
    console.info('Error occured in getSeasonBySerieIdAndSeasonNum >> ', e);
  }
  return result.rows[0];
}

export async function getEpisodesBySerieIdAndSeasonNum(serieId, seasonNum, offset = 0, limit = 10) {
  const q = 'SELECT * FROM Episodes WHERE seasonnumber = $1 and serieId = $2  ORDER BY Episodes.number ASC OFFSET $3 LIMIT $4;';
  let result = '';
  try {
    result = await query(q, [seasonNum, serieId, offset, limit]);
  } catch (e) {
    console.info('Error occured in getEpisodesBySerieIdAndSeasonNum >> ', e);
  }
  return result.rows;
}

export async function getEpisodeById(id) {
  const q = 'SELECT * FROM Episodes WHERE id = $1;';
  let result = '';
  try {
    result = await query(q, [id]);
  } catch (e) {
    console.info('Error occured in getEpisodeById >> ', e);
  }
  return result.rows;
}

export async function getEpisodeByNo(serieId, seasonNum, episodeNum) {
  const q = 'SELECT e.*, s.id as seasonid FROM Episodes e, Seasons s WHERE e."number" = $1 AND e.seasonnumber = $2 AND e.serieId = $3 AND s.serieId = e.serieId AND s.number = $2;';
  let result = '';
  try {
    result = await query(q, [episodeNum, seasonNum, serieId]);
  } catch (e) {
    console.info('Error occured in getEpisodeByNo >> ', e);
  }
  return result.rows[0];
}

/* eslint-disable max-len, indent, quotes */
export async function initializeSeriesSequence() {
  const s = await query(`SELECT MAX(id) from series`);
  const maxId = s.rows[0].max;
  await query(`ALTER SEQUENCE series_id_seq RESTART WITH ${maxId + 1} INCREMENT BY 1;`);
}

export async function createNewSerie(serie) {
  let s;
  if (serie.id) {
    s = await query(`INSERT INTO Series(id, name, airDate, inProduction, tagline, image, description, language, network, url)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *;`,
    [serie.id, serie.name, serie.airDate, serie.inProduction, serie.tagline, serie.image, serie.description, serie.language, serie.network, serie.homepage]);
  } else {
    s = await query(`INSERT INTO Series(name, airDate, inProduction, tagline, image, description, language, network, url)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *;`,
    [serie.name, serie.airDate, serie.inProduction, serie.tagline, serie.image, serie.description, serie.language, serie.network, serie.homepage]);
  }
  if (serie.genres) {
    serie.genres.split(',').forEach(async (genre) => {
      let genreId;
      let result;
      try {
        await query(`INSERT INTO Genres(name) VALUES ($1) ON CONFLICT(name) DO NOTHING;`, [genre]);
        result = await query(`SELECT id FROM Genres WHERE name = $1;`, [genre]);
        genreId = result.rows[0].id;
        await query(`INSERT INTO SerieToGenre(serieId, genreId) VALUES ($1, $2);`, [serie.id, genreId]);
      } catch (e) {
        console.info('Error occured in createNewSerie >> ', e);
      }
    });
  }
  return s;
}

export async function createNewSeason(season) {
  const airDate = (season.airDate === "") ? null : season.airDate;
  let result;
  try {
    result = await query(`INSERT INTO Seasons(serieId, name, "number", airDate, overview, poster)
                              VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;`,
      [season.serieId, season.name, season.number, airDate, season.overview, season.poster]);
    return result.rows[0];
  } catch (e) {
    console.info('Error occured in createNewSeason >> ', e);
  }
  return null;
}

export async function createNewEpisode(episode) {
  await query(`INSERT INTO Episodes(serieId, seasonnumber, name, "number", serie, overview)
                              VALUES ($1,$2,$3,$4,$5,$6);`,
    [episode.serieId, episode.season, episode.name, episode.number, episode.serie, episode.overview]);
}

export async function createNewUser(user) {
  await query(`INSERT INTO Users(name, email, password, admin)
                              VALUES ($1,$2,$3,$4);`,
    [user.name, user.email, user.password, user.admin]);
}

export async function createUserRatingBySerieId(serieId, userId, grade) {
  const queryExists = 'SELECT * FROM SerieToUser WHERE serieId=$1 AND userId=$2';
  const existsResult = await query(queryExists, [serieId, userId]);
  if(existsResult.rowCount === 0) {
    let data = await query(`INSERT INTO SerieToUser(serieId, userId, grade)
                                VALUES($1,$2,$3) RETURNING *;`,
    [serieId, userId, grade]);
    return data.rows[0];
  }
  else{
    updateUserRatingBySerieId(serieId, userId, grade);
  }
  return '';
}

export async function updateUserRatingBySerieId(serieId, userId, grade) {
  const result = await query(`UPDATE SerieToUser SET grade=$1 WHERE serieId=$2 AND userId=$3 RETURNING *`,
  [grade, serieId, userId]);
  console.log(result);
  if(result.rowCount === 1) {
    return result.rows[0];
  }
  return false;
}

export async function deleteSerie(id) {
  const q = 'DELETE FROM Series WHERE id = $1';
  const result = await query(q, [id]);
  console.log(result);
  return result.rows;
}