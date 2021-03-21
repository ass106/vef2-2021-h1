import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv = '',
} = process.env;

if (!connectionString) {
  console.error('Vantar DATABASE_URL');
  process.exit(1);
}

// Notum SSL tengingu við gagnagrunn ef við erum *ekki* í dev mode, þ.e.a.s. á local vél
const ssl = nodeEnv !== 'dev' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
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