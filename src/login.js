import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import { getUserById } from './userdb.js';

export default passport;

dotenv.config();

const {
  JWT_SECRET: jwtSecret,
  JWT_TOKENLIFETIME: tokenLifetime,
} = process.env;

if (!jwtSecret) {
  console.error('Vantar jwt secret í .env');
  process.exit(1);
}

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

async function strat(data, next) {
  const user = await getUserById(data.id);

  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
}

passport.use(new Strategy(jwtOptions, strat));

export function createTokenForUser(id) {
  const payload = { id };
  const tokenOptions = { expiresIn: tokenLifetime };
  const token = jwt.sign(payload, jwtSecret, tokenOptions);
  return { token, tokenLifetime };
}


export function optionalAuthentication(req, res, next) {
  return passport.authenticate(
    'jwt',
    {session: false},
    (err, user, info) => {
      if (err) {
        next(err);
      }

      if (!user) {
        req.user = null;
        return next();
      }

      req.user = user;
      return next();
    }
  )(req, res, next);
}

export function requireAuthentication(req, res, next) {
  return passport.authenticate(
    'jwt',
    { session: false },
    (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        console.info(info.name);
        const error = info.name === 'TokenExpiredError'
          ? 'expired token' : 'invalid token';
        return res.status(401).json({ error });
      }

      req.user = user;
      return next();
    },
  )(req, res, next);
}

export function requireAdminAuthentication(req, res, next) {
  return passport.authenticate(
    'jwt',
    { session: false },
    (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        console.info(info.name);
        const error = info.name === 'TokenExpiredError'
          ? 'expired token' : 'invalid token';
        return res.status(401).json({ error });
      }

      if (!user.admin) {
        return res.status(401).json({ error: 'User is not an admin' });
      }

      req.user = user;
      return next();
    },
  )(req, res, next);
}