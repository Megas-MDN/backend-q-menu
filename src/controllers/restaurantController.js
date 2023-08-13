const Restaurant = require('../models/Restaurant');
const bcrypt = require('bcrypt');
const { genToken, validateToken } = require('../middlewares/token');

const goRegister = async (req, res, next) => {
  try {
    const { name, route, password, email } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const newUser = await Restaurant.create({
      name,
      route,
      password: hash,
      email,
    });
    const token = genToken({
      expires: '8h',
      payload: { name, route, email, _id: newUser._id },
    });
    return res.status(201).json({ token });
  } catch (error) {
    return next({ status: 500, message: error.message });
  }
};

const goLogin = async (req, res, next) => {
  try {
    const { password, email } = req.body;
    const user = await Restaurant.findOne({ email });
    if (!user)
      return next({ status: 401, message: 'Email or Password invalid' });
    const pass = await bcrypt.compare(password, user.password);
    if (!pass)
      return next({ status: 401, message: 'Email or Password invalid' });

    const token = genToken({
      expires: '8h',
      payload: {
        name: user.name,
        route: user.route,
        email: user.email,
        _id: user._id,
      },
    });
    return res.status(200).json({ token });
  } catch (error) {
    return next({ status: 500, message: error.message });
  }
};

const getRoute = (req, res) =>
  res.status(200).json({
    route: req.payload.route,
    _id: req.payload._id,
    name: req.payload.name,
  }); // (getToken-middleware)

const getTable = async (req, res, next) => {
  // token and table (getToken-middleware)
  try {
    const { table, _id } = req.body;
    const restaurant = await Restaurant.findById(_id);
    const dTable = restaurant.tables.find((t) => t.hash === table);
    return res.status(200).send({
      message: !!dTable ? 'Table in the restaurant' : 'Table not found',
      tables: dTable,
    });
  } catch (error) {
    return next({ status: 500, message: error.message });
  }
};

module.exports = { goRegister, goLogin, getRoute, getTable };
