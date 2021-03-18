import pg from 'pg';
import dotenv from 'dotenv';
import format from 'pg-format';

dotenv.config();

const {
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv = 'development',
} = process.env;

// Notum SSL tengingu við gagnagrunn ef við erum *ekki* í development mode, þ.e.a.s. á local vél
const ssl = nodeEnv !== 'development' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

export async function query(_query, values) {
  const client = await pool.connect();

  try {
    const result = await client.query(_query, values);

    return result;
  } finally {
    client.release();
  }
}

export async function formatQuery(_query, values = []) {
  const client = await pool.connect();

  try {
    const result = await client.query(format(_query, values));
    return result;
  } finally {
    client.release();
  }
}
// TODO rest af föllum
