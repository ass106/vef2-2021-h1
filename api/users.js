/**
 * user.js
 * All functions related to users. Login, registration etc.
 */
import express from 'express';
import {
  body,
  param,
  validationResult,
} from 'express-validator';
import * as userDb from '../src/userdb.js';
import { createTokenForUser, requireAuthentication, requireAdminAuthentication } from '../src/login.js';
import { paginationRules, paramIdRules } from '../src/form-rules.js'

export const router = express.Router();

router.get('/',
  requireAdminAuthentication,
  paginationRules(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({ errors: errors.array() });
    }

    const {
      offset = 0, limit = 10
    } = req.query;

    const items = await userDb.getAllUsers('Users', offset, limit);

    const next = items.length === limit ? { href: `http://localhost:3000/users?offset=${offset+limit}&limit=${limit}`}: undefined;
    const prev = offset > 0 ? { href: `http://localhost:3000/users?offset=${Math.max(offset-limit, 0)}&limit=${limit}`}: undefined;

    if (items) {
      return res.json({
        limit,
        offset,
        items,
        _links: {
          self: {
            href: `http://localhost:3000/users?offset=${offset}&limit=${limit}`
          },
          next,
          prev
        }
       });
    }
    return res.status(404).json({ msg: 'Table not found' });
  });

router.post('/register',
  body('username')
    .trim()
    .isLength({ min: 1, max: 256 })
    .withMessage('username is required, max 256 characters')
    .custom((value) => {
      return userDb.getUserByName(value).then(user => {
        if(user) {
          return Promise.reject('username already exists');
        }
      });
    }),
  body('email')
    .trim()
    .isEmail()
    .withMessage('email is required, max 256 characters')
    .normalizeEmail()
    .custom((value) => {
      return userDb.getUserByEmail(value).then(user => {
        if (user) {
          return Promise.reject('email already exists');
        }
      });
    }),
  body('password')
    .trim()
    .isLength({ min: 10, max: 256 })
    .withMessage('Password is required, min 10 characters, max 256 characters'),
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    const createdUser = await userDb.createUser({ name: username, email, password });

    if (createdUser) {
      return res.json(
        createdUser);
    }

    return res.json({ error: 'Error registering' });
});

router.post('/login',
  body('username')
    .trim()
    .isLength({ min: 1, max: 256 })
    .withMessage('username is required, max 256 characters'),
  body('password')
    .trim()
    .isLength({ min: 10, max: 256 })
    .withMessage('password is required, min 10 characters, max 256 characters'),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()){
      return res.status(404).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    const user = await userDb.getUserByName(username);

    if (!user) {
      return res.status(401).json({ errors: [{
        value: username,
        msg: "username or password incorrect",
        param: 'username',
        location: 'body'
      }]});
    }

    const passwordIsCorrect = userDb.comparePasswords(password, user.password);

    if (passwordIsCorrect) {
      const token = createTokenForUser(user.id);
      console.info(token);
      return res.json({
        "user": {
          id: user.id,
          username: user.name,
          email: user.email,
          admin: user.admin
        },
        token: token.token,
        expiresIn: token.tokenLifetime,
      });
    }

    return res.status(401).json({ errors: [{
      value: username,
      msg: "username or password incorrect",
      param: 'username',
      location: 'body'
    }]});
});

router.get('/me',
  requireAuthentication,
  (req, res) => {
    res.json(
      req.user,
    );
  });


router.patch('/me', requireAuthentication,
  body('password')
    .if(body('password').exists())
    .isLength({ min: 10, max: 256 })
    .withMessage('password must be from 1 to 256 characters long'),
  body('email')
    .if(body('email').exists())
    .isEmail()
    .withMessage('email must be an email, example@example.com')
    .normalizeEmail()
    .custom((value) => {
      return userDb.getUserByEmail(value).then(user => {
        if (user) {
          return Promise.reject('email already exists');
        }
      });
    }),
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body;

    if (!email && !password) {
      return res.status(400).json({
        errors: [{
          value: req.body,
          msg: 'require at least one of: email, password',
          param: '',
          location: 'body',
        }],
      });
    }

    req.user.email = email || req.user.email;

    if (password) {
      req.user.password = password;
    }

    console.log(req.user.email, req.user.password);

    const user = await userDb.updateUser(req.user);

    res.json({
      user
    });
  });


router.get('/:id',
requireAdminAuthentication,
paramIdRules('id'),
async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const data = await userDb.getUserById(req.params.id);
  if (data) return res.json( data );
  return res.status(404).json({ msg: 'User not found' });
});