import express from 'express';
import dotenv from 'dotenv';
import { router as tvRouter, getGenres, postGenres } from '../api/tv.js';
import { router as userRouter } from '../api/users.js';
import passport, { requireAdminAuthentication } from './login.js';
import { webtree } from './webtree.js';

dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

const app = express();

// þetta býr til req.body hlut
app.use(express.json());

app.use(passport.initialize());

app.get('/', (req, res) => {
  res.json(webtree);
});

app.use('/users', userRouter);
app.use('/tv', tvRouter);
app.get('/genres', getGenres);
app.post('/genres', requireAdminAuthentication, postGenres);

function notFoundHandler(req, res, next) { // eslint-disable-line
  res.status(404).json({ error: 'Not found' });
}

function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid json' });
  }

  return res.status(500).json({ error: 'Internal server error' });
}

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});