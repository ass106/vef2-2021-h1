// db.js
import { intToWatch, query } from './utils.js';

export async function getCountOfTable(table) {
  const result = await query(`SELECT COUNT(*) FROM ${table};`);
  return Number(result.rows[0].count);
}

export async function getAllFromTable(table, attr = '*', offset = 0, limit = 10, orderBy = null) {
  const q = orderBy ? `SELECT ${attr} FROM ${table} ORDER BY ${orderBy} OFFSET ${offset} LIMIT ${limit};` : `SELECT ${attr} FROM ${table} OFFSET ${offset} LIMIT ${limit};`;
  let result = '';
  result = await query(q);
  if (result.rowCount > 0) {
    return result.rows;
  }
  return false;
}

export async function getSerieById(id) {
  const serieQuery = 'SELECT * FROM Series WHERE id = $1;';
  const serieResult = await query(serieQuery, [id]);
  if (serieResult.rowCount === 1) {
    return serieResult.rows[0];
  }
  return false;
}

export async function getSerieByIdWithSeasons(id, userId = false) {
  const serieQuery = 'SELECT * FROM Series s WHERE id = $1;';
  const ratingQuery = 'SELECT COUNT(*) AS ratingcount, AVG(grade) AS rating FROM SerieToUser WHERE serieId = $1;';
  const genreQuery = 'SELECT name FROM SerieToGenre JOIN Genres ON genreId = Genres.id WHERE serieId = $1;';
  const seasonQuery = 'SELECT * FROM Seasons WHERE serieId = $1;';

  const serieResult = await query(serieQuery, [id]);
  const ratingResult = await query(ratingQuery, [id]);
  const genreResult = await query(genreQuery, [id]);
  const seasonResult = await query(seasonQuery, [id]);
  let userResult;
  if (userId) {
    const userQuery = 'SELECT grade, status from SerieToUser WHERE serieId = $1 AND userId = $2;';
    userResult = await query(userQuery, [id, userId]);
    userResult.rows[0].status = intToWatch(userResult.rows[0].status);
  } else userResult = { rows: 'User not logged in' };

  if (serieResult.rowCount === 1) {
    const rate = ratingResult.rows[0].rating;
    ratingResult.rows[0].rating = rate ? Number.parseInt(rate, 10).toFixed(1) : 0;
    return {
      info: serieResult.rows[0],
      user: userResult.rows,
      ratings: ratingResult.rows[0],
      genres: genreResult.rows,
      seasons: seasonResult.rows,
    };
  }
  return false;
}

export async function getSeasonsBySerieId(serieId, offset = 0, limit = 10) {
  const dataQuery = 'SELECT * FROM Seasons WHERE serieId = $1 ORDER BY number OFFSET $2 LIMIT $3;';
  const countQuery = 'SELECT COUNT(*) FROM Seasons WHERE serieId = $1;';
  const result = await query(dataQuery, [serieId, offset, limit]);
  const count = await query(countQuery, [serieId]);
  return {
    data: result.rows,
    count: Number(count.rows[0].count),
  };
}

export async function getSeasonBySerieIdAndSeasonNum(serieId, seasonNum) {
  const q = 'SELECT * FROM Seasons WHERE number = $1 and serieId = $2;';
  const result = await query(q, [seasonNum, serieId]);
  return result.rows[0];
}

export async function getEpisodesBySerieIdAndSeasonNum(serieId, seasonNum, offset = 0, limit = 10) {
  const q = 'SELECT * FROM Episodes WHERE seasonnumber = $1 and serieId = $2  ORDER BY Episodes.number ASC OFFSET $3 LIMIT $4;';
  const result = await query(q, [seasonNum, serieId, offset, limit]);
  return result.rows;
}

export async function getEpisodeByNo(serieId, seasonNum, episodeNum) {
  const q = 'SELECT e.*, s.id as seasonid FROM Episodes e, Seasons s WHERE e.number = $1 AND e.seasonnumber = $2 AND e.serieId = $3 AND s.serieId = e.serieId AND s.number = $2;';
  const result = await query(q, [episodeNum, seasonNum, serieId]);
  if (result.rowCount === 1) {
    return result.rows[0];
  }
  return false;
}

export async function initializeSeriesSequence() {
  const s = await query('SELECT MAX(id) from series');
  const maxId = s.rows[0].max;
  await query(`ALTER SEQUENCE series_id_seq RESTART WITH ${maxId + 1} INCREMENT BY 1;`);
}

export async function createSerie(serie) {
  let s;
  if (serie.id) {
    s = await query(`INSERT INTO Series(id, name, airDate, inProduction, tagline, image, description, language, network, url)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *;`,
    [serie.id,
      serie.name,
      serie.airDate,
      serie.inProduction,
      serie.tagline,
      serie.image,
      serie.description,
      serie.language,
      serie.network,
      serie.url]);
  } else {
    s = await query('INSERT INTO Series(name, airDate, inProduction, tagline, image, description, language, network, url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *;',
      [serie.name,
        serie.airDate,
        serie.inProduction,
        serie.tagline,
        serie.image,
        serie.description,
        serie.language,
        serie.network,
        serie.url]);
  }
  if (serie.genres) {
    serie.genres.split(',').forEach(async (genre) => {
      let genreId;
      let result;
      try {
        await query('INSERT INTO Genres(name) VALUES ($1) ON CONFLICT(name) DO NOTHING;', [genre]);
        result = await query('SELECT id FROM Genres WHERE name = $1;', [genre]);
        genreId = result.rows[0].id;
        await query('INSERT INTO SerieToGenre(serieId, genreId) VALUES ($1, $2);', [serie.id, genreId]);
      } catch (e) {
        console.info('Error occured >> ', e);
      }
    });
  }
  return s.rows[0];
}

export async function createSeason(season) {
  const airDate = (season.airDate === '') ? null : season.airDate;
  let result;
  try {
    result = await query(`INSERT INTO Seasons(serieId, name, "number", airDate, overview, poster)
                              VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;`,
    [season.serieId,
      season.name,
      season.number,
      airDate,
      season.overview,
      season.poster]);
    return result.rows[0];
  } catch (e) {
    console.info('Error occured >> ', e);
  }
  return null;
}

export async function createEpisode(episode) {
  const result = await query(`INSERT INTO Episodes(serieId, seasonnumber, name, "number", airdate, overview)
                              VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;`,
  [episode.serieId,
    episode.season,
    episode.name,
    episode.number,
    episode.airdate,
    episode.overview]);

  if (result.rowCount === 1) {
    return result.rows[0];
  }
  return false;
}

export async function createUser(user) {
  await query(`INSERT INTO Users(name, email, password, admin)
  VALUES ($1,$2,$3,$4);`,
  [user.name, user.email, user.password, user.admin]);
}

export async function updateUserRatingBySerieId(serieId, userId, grade) {
  const result = await query('UPDATE SerieToUser SET grade=$1 WHERE serieId=$2 AND userId=$3 RETURNING *',
    [grade, serieId, userId]);

  if (result.rowCount === 1) {
    return result.rows[0];
  }
  return false;
}

export async function updateUserStatusBySerieId(serieId, userId, status) {
  const result = await query('UPDATE SerieToUser SET status=$1 WHERE serieId=$2 AND userId=$3 RETURNING *',
    [status, serieId, userId]);

  if (result.rowCount === 1) {
    return result.rows[0];
  }
  return false;
}

export async function createUserRatingBySerieId(serieId, userId, grade) {
  const queryExists = 'SELECT * FROM SerieToUser WHERE serieId=$1 AND userId=$2';
  const existsResult = await query(queryExists, [serieId, userId]);

  if (existsResult.rowCount === 0) {
    const data = await query(`INSERT INTO SerieToUser(serieId, userId, grade)
    VALUES($1,$2,$3) RETURNING *;`,
    [serieId, userId, grade]);
    return data.rows[0];
  }
  return updateUserRatingBySerieId(serieId, userId, grade);
}

export async function createUserStatusBySerieId(serieId, userId, status) {
  const queryExists = 'SELECT * FROM SerieToUser WHERE serieId=$1 AND userId=$2';
  const existsResult = await query(queryExists, [serieId, userId]);

  if (existsResult.rowCount === 0) {
    const data = await query(`INSERT INTO SerieToUser(serieId, userId, status)
    VALUES($1,$2,$3) RETURNING *;`,
    [serieId, userId, status]);

    return data.rows[0];
  }
  return updateUserStatusBySerieId(serieId, userId, status);
}

export async function updateSerieById(id, attributes) {
  const querySerie = 'SELECT * FROM Series WHERE id=$1';
  const serieResult = await query(querySerie, [id]);

  if (serieResult.rowCount === 1) {
    const curVals = serieResult.rows[0];
    const newVals = {
      name: attributes.name || curVals.name,
      airDate: attributes.airDate || curVals.airdate,
      inProduction: attributes.inProduction || curVals.inproduction,
      tagline: attributes.tagline || curVals.tagline,
      image: attributes.image || curVals.image,
      description: attributes.description || curVals.description,
      language: attributes.language || curVals.language,
      network: attributes.network || curVals.network,
      url: attributes.url || curVals.url,
    };

    const q = `UPDATE Series SET name=$1, airDate=$2,
                    inProduction=$3, tagline=$4,
                    image=$5,
                    description=$6, language=$7,
                    network=$8, url=$9 WHERE id=$10 RETURNING *`;
    const result = await query(q, [newVals.name, newVals.airDate,
      newVals.inProduction,
      newVals.tagline,
      newVals.image,
      newVals.description,
      newVals.language,
      newVals.network,
      newVals.url,
      id]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  }
  return false;
}

export async function updateSerieImageById(id, image) {
  await query('UPDATE Series SET image = $1 WHERE id = $2', [image, id]);
}

export async function updateSeasonPosterById(id, poster) {
  await query('UPDATE Seasons SET poster = $1 WHERE id = $2', [poster, id]);
}

export async function deleteUserData(serieId, userId) {
  const q = 'DELETE FROM SerieToUser WHERE serieId = $1 AND userId = $2 RETURNING *';
  const result = await query(q, [serieId, userId]);
  return result.rows;
}

export async function deleteSerie(id) {
  const q = 'DELETE FROM Series WHERE id = $1 RETURNING *';
  const result = await query(q, [id]);
  return result.rows;
}
export async function deleteEpisodesBySeason(id, number) {
  const q = 'DELETE FROM Episodes WHERE serieId = $1 AND seasonNumber = $2 RETURNING *;';
  await query(q, [id, number]);
}

export async function deleteSeasonBySerieIdAndSeasonNumber(id, number) {
  const q = 'DELETE FROM Seasons WHERE serieId=$1 AND number=$2';
  await deleteEpisodesBySeason(id, number);
  await query(q, [id, number]);
}

export async function deleteEpisode(episodeNum, serieId, seasonNum) {
  const q = 'DELETE FROM Episodes WHERE id = $1 AND serieId = $2 AND seasonNumber = $3 RETURNING *;';
  const result = await query(q, [episodeNum, serieId, seasonNum]);
  return result;
}