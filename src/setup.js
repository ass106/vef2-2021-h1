import fs from 'fs';
import { readFile } from 'fs/promises';
import dotenv from 'dotenv';
import csv from 'csv-parser';

import {
  createNewSerie,
  createNewSeason,
  createNewEpisode,
  initializeSeriesSequence,
} from './db.js';

import { query } from './utils.js';
import { createUser } from './userdb.js';

dotenv.config();

const {
  DATABASE_URL: connectionString,
} = process.env;
þ
console.info('process.env: ', process.env.DATABASE_URL);

if (!connectionString) {
  console.error('Vantar DATABASE_URL!');
  process.exit(1);
}

async function createTables() {
  console.info('reading schema.sql')
  const createTable = await readFile('./sql/schema.sql');
  const tData = createTable.toString('utf-8');
  await query(tData);
  console.info('Created tables from Schema.sql')
  return;
}

async function setupSeries() {
  console.info('Reading series.csv');
  fs.createReadStream('./data/series.csv')
    .pipe(csv())
    .on('data', async (serie) => {
      await createNewSerie(serie);
    })
    .on('end', async () => {
      await initializeSeriesSequence();
      console.info('Finished reading series.csv');
      setTimeout(async () => await setupSeasons(), 2000);
    });
    return;
}

async function setupSeasons() {
  console.info('Reading seasons.csv');
  fs.createReadStream('./data/seasons.csv')
    .pipe(csv())
    .on('data', async (season) => {
      await createNewSeason(season);
    })
    .on('end', async () => {
      console.info('Finished reading seasons.csv');
      setTimeout(async () => await setupEpisodes(), 2000);
    });
    return;
}

async function setupEpisodes() {
  console.info('Reading episodes.csv');
  fs.createReadStream('./data/episodes.csv')
    .pipe(csv())
    .on('data', async (episode) => {
      await createNewEpisode(episode);
    })
    .on('end', async () => {
      console.info('Finished reading episodes.csv');
    });
    return;
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