import { query } from './utils.js';
import bcrypt from 'bcrypt';

export async function getAllUsers() {
  const q = 'SELECT id,name,email,admin FROM Users';
  try {
    const result = await query(q);
    return result.rows;
  }
  catch (err) {
    console.error(err);
  }
  return [];
}

export async function createUser(user, admin = false) {
  if (admin) {
    const q = 'INSERT INTO Users (name, email, password, admin) VALUES ($1, $2, $3, $4) RETURNING id,name,email,admin';

    try {
      const result = await query(q, [user.name, user.email, await bcrypt.hash(user.password, 10), true]);
      if (result.rowCount === 1){
        return result.rows[0];
      }
    }
    catch (error) {
      console.error('Error creating user', error);
    }
  }

  const q = 'INSERT INTO Users (name, email, password) VALUES ($1, $2, $3) RETURNING id,name,email,admin';

  try {
    const result = await query(q, [user.name, user.email, await bcrypt.hash(user.password, 10)]);
    if (result.rowCount === 1){
      return result.rows[0];
    }
  }
  catch (error) {
    console.error('Error creating user', error);
  }
  return false;
}

export async function updateUser(user) {
  let q;
  const param = [user.email, user.id]
  if (user.password) {
    q = 'UPDATE Users SET email=$1, password=$3 WHERE id=$2 RETURNING id,name,email,admin'
    param.push(await bcrypt.hash(user.password, 10));
  }
  else{
    q = 'UPDATE Users SET email=$1 WHERE id=$2 RETURNING id,name,email,admin';
  }
  
  try {
    const result = await query(q, param);

    if(result.rowCount === 1) {
      return result.rows[0];
    }
  }
  catch (err) {
    console.error('Could not update user', err);
    return null;
  }
  return false;
}

export async function getUserByName(name) {
  const q = 'SELECT * FROM Users WHERE name = $1;';

  try {
    const result = await query(q, [name]);

    if(result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Error occured :>> ', e);
    return null;
  }
  return false;
}

export async function getUserByEmail(email) {
  const q = 'SELECT id,name,email,admin FROM Users WHERE email = $1;';

  try {
    const result = await query(q, [email]);

    if(result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Error occured :>> ', e);
    return null;
  }
  return false;
}

export async function getUserById(id) {
  const q = 'SELECT id,name,email,admin FROM Users WHERE id = $1;';
  try {
    const result = await query(q, [id]);
    if(result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Error occured :>> ', e);
    return null;
  }
  return false;
}

export async function comparePasswords(password, hash) {
  const result = await bcrypt.compare(password, hash);

  return result;
}