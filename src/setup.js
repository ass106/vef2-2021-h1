import fs from 'fs';
import { readFile } from 'fs/promises';
import dotenv from 'dotenv';
import csv from 'csv-parser';
import cloudinary from 'cloudinary';
import {
  createSerie,
  createSeason,
  createEpisode,
  initializeSeriesSequence,
  updateSerieImageById,
  updateSeasonPosterById,
} from './db.js';
import { query } from './utils.js';

import { createUser } from './userdb.js';

dotenv.config();

const {
  DATABASE_URL: connectionString,
} = process.env;

console.info('process.env >> ', process.env.DATABASE_URL);

if (!connectionString) {
  console.error('Missing DATABASE_URL from .env');
  process.exit(1);
}

async function createTables() {
  const createTable = await readFile('./sql/schema.sql');
  const tData = createTable.toString('utf-8');
  await query(tData);
}

async function uploadSeasonPosters() {
  const seasons = await query('SELECT * from Seasons;');
  seasons.rows.forEach((season) => {
    if (season.poster) {
      cloudinary.uploader.upload(`data/img/${season.poster}`, async (res) => {
        await updateSeasonPosterById(season.id, res.secure_url);
      });
    }
  });
  console.info('INFO: Finished uploading season posters');
}

async function uploadSerieImages() {
  const series = await query('SELECT * from Series;');
  series.rows.forEach((serie) => {
    if (serie.image) {
      cloudinary.uploader.upload(`data/img/${serie.image}`, async (res) => {
        await updateSerieImageById(serie.id, res.secure_url);
      });
    }
  });
  console.info('INFO: Finished uploading serie images');
}

async function setupEpisodes() {
  console.info('INFO: Reading episodes.csv');
  fs.createReadStream('./data/episodes.csv')
    .pipe(csv())
    .on('data', async (episode) => {
      await createEpisode(episode);
    })
    .on('end', async () => {
      console.info('INFO: Finished reading episodes.csv');
    });
}

async function setupSeasons() {
  console.info('INFO: Reading seasons.csv');
  fs.createReadStream('./data/seasons.csv')
    .pipe(csv())
    .on('data', async (season) => {
      await createSeason(season);
    })
    .on('end', async () => {
      console.info('INFO: Finished reading seasons.csv');
      setTimeout(async () => uploadSeasonPosters(), 2000);
      setTimeout(async () => setupEpisodes(), 2000);
    });
}

async function setupSeries() {
  console.info('INFO: Reading series.csv');
  fs.createReadStream('./data/series.csv')
    .pipe(csv())
    .on('data', async (serie) => {
      await createSerie(serie);
    })
    .on('end', async () => {
      await initializeSeriesSequence();
      console.info('INFO: Finished reading series.csv');
      setTimeout(async () => uploadSerieImages(), 2000);
      setTimeout(async () => setupSeasons(), 2000);
    });
}

async function setup() {
  await createTables();
  await setupSeries();

  createUser({
    name: 'admin',
    email: 'admin@admin.com',
    password: '0123456789',
  },
  true);

  createUser({
    name: 'notAdmin',
    email: 'example@example.com',
    password: '0123456789',
  });
}

setup();
