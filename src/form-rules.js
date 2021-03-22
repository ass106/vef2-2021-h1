import {
  body, query, param, validationResult,
} from 'express-validator';
import { getEpisodeByNo, getSerieById, getSeasonBySerieIdAndSeasonNum } from './db.js';
import * as userDb from './userdb.js';

/* eslint-disable consistent-return */
export const serieRules = () => [
  body('name')
    .isLength({ min: 1 })
    .isLength({ max: 128 })
    .withMessage('name is required, max 128 characters'),
  body('airDate')
    .isDate()
    .withMessage('airDate must be a date'),
  body('inProduction')
    .isBoolean()
    .withMessage('inProduction must be a boolean'),
  body('description')
    .isString()
    .withMessage('description must be a string'),
  body('language')
    .isString()
    .isLength(2),
];

export const patchSerieRules = () => [
  body()
    .custom((value, { req }) => req.body.name
      || req.body.airDate
      || req.body.inProduction
      || req.body.description
      || req.body.language
      || req.body.tagline
      || req.body.network
      || req.body.url)
    .withMessage('require at least one value of: name, airDate, inProduction, tagline, image, description, language, network, url'),
];

export const seasonRules = () => [
  body('name')
    .isLength({ min: 1 })
    .isLength({ max: 128 })
    .withMessage('name is required, max 128 characters'),
  body('number')
    .isInt()
    .custom((value) => Number.parseInt(value, 10) >= 0),
];

export const paginationRules = () => [
  query('offset')
    .if(query('offset').exists())
    .custom((value) => Number.parseInt(value, 10) >= 0)
    .withMessage('offset must be a positive integer'),
  query('limit')
    .if(query('limit').exists())
    .custom((value) => Number.parseInt(value, 10) >= 0)
    .withMessage('limit must be a positive integer'),
];

export const ratingRules = () => [
  body('grade')
    .isInt()
    .withMessage('Grade must be an integer greater than or equal to 0 and less than or equal to 5')
    .bail()
    .custom((value) => Number.parseInt(value, 10) <= 5 && Number.parseInt(value, 10) >= 0)
    .withMessage('Grade must be an integer greater than or equal to 0 and less than or equal to 5'),
];

export const statusRules = () => [
  body('status')
    .isInt()
    .withMessage('Status must be an integer greater than or equal to 0 and less than or equal to 2')
    .bail()
    .custom((value) => Number.parseInt(value, 10) <= 2 && Number.parseInt(value, 10) >= 0)
    .withMessage('Status must be an integer greater than or equal to 0 and less than or equal to 2'),
];

export const paramIdRules = (idField) => [
  param(idField)
    .isInt()
    .custom((value) => value > 0)
    .withMessage(`${idField} must be an integer larger than 0`),
];

export const patchUserRules = () => [
  body('password')
    .if(body('password').exists())
    .isLength({ min: 10, max: 256 })
    .withMessage('password must be from 1 to 256 characters long'),
  body('email')
    .if(body('email').exists())
    .isEmail()
    .withMessage('email must be an email, example@example.com')
    .normalizeEmail()
    .custom((value) => userDb.getUserByEmail(value).then((user) => {
      if (user) {
        return Promise.reject('email already exists');
      }
    })),
];

export const loginRules = () => [
  body('username')
    .trim()
    .isLength({ min: 1, max: 256 })
    .withMessage('username is required, max 256 characters'),
  body('password')
    .trim()
    .isLength({ min: 10, max: 256 })
    .withMessage('password is required, min 10 characters, max 256 characters'),
];

export const registerRules = () => [
  body('username')
    .trim()
    .isLength({ min: 1, max: 256 })
    .withMessage('username is required, max 256 characters')
    .custom((value) => userDb.getUserByName(value).then((user) => {
      if (user) {
        return Promise.reject('username already exists');
      }
    })),
  body('email')
    .trim()
    .isEmail()
    .withMessage('email is required, max 256 characters')
    .normalizeEmail()
    .custom((value) => userDb.getUserByEmail(value).then((user) => {
      if (user) {
        return Promise.reject('email already exists');
      }
    })),
  body('password')
    .trim()
    .isLength({ min: 10, max: 256 })
    .withMessage('Password is required, min 10 characters, max 256 characters'),
];

export async function serieExists(req, res, next) {
  const serie = await getSerieById(req.params.serieId);
  if (!serie) {
    return res.status(404).json({
      errors: [{
        param: 'id',
        msg: `Could not find serie with given id: ${req.params.serieId}`,
        location: 'params',
      }],
    });
  }
  return next();
}

export async function seasonExists(req, res, next) {
  const { serieId, seasonNum } = req.params;
  const season = await getSeasonBySerieIdAndSeasonNum(serieId, seasonNum);
  if (!season) {
    return res.status(404).json({
      errors: [{
        param: 'id',
        msg: `Could not find serie with given id: ${req.params.serieId} + season number: ${seasonNum}`,
        location: 'params',
      }],
    });
  }
  return next();
}

export async function episodeExists(req, res, next) {
  const { serieId, seasonNum, episodeNum } = req.params;
  const episode = await getEpisodeByNo(serieId, seasonNum, episodeNum);
  if (!episode) {
    return res.status(404).json({
      errors: [{
        param: 'id',
        msg: `Could not find serie with given id: ${req.params.serieId} + season number: ${seasonNum} + episode number: ${episodeNum}`,
        location: 'params',
      }],
    });
  }
  return next();
}

export function checkValidationResult(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
}

export async function uniqueSeason(req, res, next) {
  const { serieId } = req.params;
  const seasonNum = req.body.number;
  const season = await getSeasonBySerieIdAndSeasonNum(serieId, seasonNum);
  if (season) {
    return res.status(400).json({
      errors: [{
        param: 'non-unique',
        msg: `Given season number: ${seasonNum} already exists`,
        location: 'params',
      }],
    });
  }
  return next();
}

export async function uniqueEpisode(req, res, next) {
  const { serieId, seasonNum } = req.params;
  const episodeNum = req.body.number;
  const episode = await getEpisodeByNo(serieId, seasonNum, episodeNum);
  if (episode) {
    return res.status(400).json({
      errors: [{
        param: 'non-unique',
        msg: `Given episode number: ${episodeNum} already exists`,
        location: 'body',
      }],
    });
  }
  return next();
}