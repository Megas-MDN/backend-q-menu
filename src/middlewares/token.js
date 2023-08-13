require('dotenv/config');

const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'jwt_secret';

const genToken = ({ expires = '1h', payload }) => {
  const jwtConfig = {
    expiresIn: expires,
    algorithm: 'HS256',
  };
  return jwt.sign(payload, secret, jwtConfig);
};

const validateToken = (token) => {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    return { status: 400, message: error.message };
  }
};

module.exports = { genToken, validateToken };
