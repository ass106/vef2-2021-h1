import express from 'express';
import { body } from 'express-validator';
import * as db from '../src/db.js';
import { getLinks, sanitize } from '../src/utils.js';
import { checkValidationResult, paginationRules } from '../src/form-rules.js';
import { requireAdminAuthentication } from '../src/login.js';

export const router = express.Router();

router.get('/',
  paginationRules(),
  async (req, res) => {
    const {
      offset = 0,
      limit = 10,
    } = req.query;

    const genres = await db.getAllFromTable('Genres', 'name', offset, limit);
    const length = await db.getCountOfTable('Genres');
    const _links = getLinks('genres', length, offset, limit);

    res.json({
      offset: offset,
      limit: limit,
      genres,
      _links,
    });
  });

router.post('/',
  requireAdminAuthentication,
  body('name')
    .isLength({ min: 1 })
    .withMessage('Body must have field "name"'),
  checkValidationResult,
  async (req, res) => {
    const {
      name,
    } = sanitize(req.body);

    const q = 'INSERT INTO Genres(name) VALUES ($1) RETURNING *;';
    const result = await db.query(q, [name]);

    if (!result) {
      return res.status(400).json({ err: `Genre: ${name} already exists` });
    }
    return res.json(result.rows);
  });