const { validateToken } = require('./token');

module.exports = (req, _res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization)
      return next({ status: 401, message: 'Token not found!' });
    const payload = validateToken(authorization);
    if (payload?.status) return next({ ...payload });

    req.payload = payload;
    return next();
  } catch (error) {
    return next({ status: 400, message: error.message });
  }
};
