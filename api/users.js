/**
 * user.js
 * All functions related to users. Login, registration etc.
 */
import express from 'express';
import * as db from '../src/db.js';
import * as userDb from '../src/userdb.js';
import { createTokenForUser, requireAuthentication, requireAdminAuthentication } from '../src/login.js';
import * as fr from '../src/form-rules.js'
import { getLinks, sanitize } from '../src/utils.js';

export const router = express.Router();

router.get('/',
  requireAdminAuthentication,
  fr.paginationRules(),
  fr.checkValidationResult,
  async (req, res) => {
    const {
      offset = 0, limit = 10,
    } = req.query;

    const items = await userDb.getAllUsers(offset, limit);
    const count = await db.getCountOfTable('Users');
    const _links = getLinks('users', count, offset, limit);
    if (items) {
      return res.json({
        limit,
        offset,
        items,
        _links,
      });
    }
    return res.status(404).json({ msg: 'Table not found' });
  });

router.post('/register',
  fr.registerRules(),
  fr.checkValidationResult,
  async (req, res) => {
    const { username, email, password } = sanitize(req.body);
    const createdUser = await userDb.createUser({ name: username, email, password });
    if (createdUser) {
      return res.json(
        createdUser,
      );
    }
    return res.status(404).json({ error: 'Error registering' });
  });

router.post('/login',
  fr.loginRules(),
  fr.checkValidationResult,
  async (req, res) => {
    const { username, password } = sanitize(req.body);
    const user = await userDb.getUserByName(username);
    if (!user) {
      return res.status(401).json({
        errors: [{
          value: username,
          msg: 'username or password incorrect',
          param: 'username',
          location: 'body',
        }],
      });
    }
    const passwordIsCorrect = userDb.comparePasswords(password, user.password);
    if (passwordIsCorrect) {
      const token = createTokenForUser(user.id);
      return res.json({
        user: {
          id: user.id,
          username: user.name,
          email: user.email,
          admin: user.admin,
        },
        token: token.token,
        expiresIn: token.tokenLifetime,
      });
    }
    return res.status(401).json({
      errors: [{
        value: username,
        msg: 'username or password incorrect',
        param: 'username',
        location: 'body',
      }],
    });
  });

router.get('/me',
  requireAuthentication,
  (req, res) => {
    res.json(
      req.user,
    );
  });

router.patch('/me', requireAuthentication,
  fr.patchUserRules(),
  fr.checkValidationResult,
  async (req, res) => {
    const { email, password } = sanitize(req.body);
    if (!email && !password) {
      res.status(404).json({
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
    const user = await userDb.updateUser(req.user);
    res.json({
      user,
    });
  });

router.get('/:id',
  requireAdminAuthentication,
  fr.paramIdRules('id'),
  fr.checkValidationResult,
  async (req, res) => {
    const data = await userDb.getUserById(req.params.id);
    if (data) return res.json(data);
    return res.status(404).json({ msg: 'User not found' });
  });