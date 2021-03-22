import xss from 'xss';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv = '',
  BASE_URL: url = 'http://localhost:3000',
} = process.env;

if (!connectionString) {
  console.error('Missing DATABASE_URL from .env');
  process.exit(1);
}

// Notum SSL tengingu við gagnagrunn ef við erum *ekki* í dev mode, þ.e.a.s. á local vél
const ssl = nodeEnv !== 'dev' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Error connecting to database, program shut down', err);
  process.exit(-1);
});

export async function query(q, values = []) {
    const client = await pool.connect();
    let result = '';
    try {
      result = await client.query(q, values);
    } catch (e) {
      console.info('Error occured in query >>', e);
    } finally {
      await client.release();
    }
    return result;
  }

export function getLinks(path = '', lengthString, offsetString, limitString) {
  const length = Number(lengthString);
  const offset = Number(offsetString);
  const limit = Number(limitString);
  let next; let prev;

  if (length > limit + offset) {
    next = { href: new URL(`${path}?offset=${offset + limit}&limit=${limit}`, url) };
  } else {
    next = undefined;
  }
  if (offset > 0) {
    prev = { href: new URL(`/${path}?offset=${Math.max(offset - limit, 0)}&limit=${limit}`, url) };
  } else {
    prev = undefined;
  }
  const self = { href: new URL(`${path}?offset=${offset}&limit=${limit}`, url) };

  return {
    self,
    next,
    prev,
  };
}

export function sanitize(...request) {
  const req = request[0];
  for (const value in req) {
    req[value] = xss(req[value]);
  }
  return req;
}

export function intToWatch(i) {
  switch (i) {
    case 0: return 'Langar að horfa';
    case 1: return 'Er að horfa';
    case 2: return 'Hef horft';
    default: return null;
  }
}