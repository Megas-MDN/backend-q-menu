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
    return res.status(200).json({
      token,
      restaurant: {
        name: user.name,
        route: user.route,
        email: user.email,
        tables: user.tables,
        menu: user.menu,
      },
    });
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
    const { _id } = req.payload;
    const restaurant = await Restaurant.findById(_id, '-password');
    const dTable = restaurant ? restaurant.tables : null;
    return res.status(200).send({
      message: !!dTable ? 'Table in the restaurant' : 'Table not found',
      tables: dTable,
    });
  } catch (error) {
    return next({ status: 500, message: error.message });
  }
};

const getTableByHash = async (req, res, next) => {
  // token and table (getToken-middleware)
  try {
    const { hash } = req.params;
    const { _id } = req.payload;
    const restaurant = await Restaurant.findById(_id, '-password');
    const dTable = restaurant.tables.find(
      (t) => t.hash === hash || t.name === hash
    );
    return res.status(200).send({
      message: !!dTable ? 'Table in the restaurant' : 'Table not found',
      tables: dTable,
    });
  } catch (error) {
    return next({ status: 500, message: error.message });
  }
};

const getMenu = async (req, res, next) => {
  try {
    const { route } = req.params;
    const restaurant = await Restaurant.findOne({ route });
    if (!restaurant)
      return next({ status: 404, message: 'Restaurant not found!' });

    return res.status(200).send({
      message: `Menu from ${restaurant.name}`,
      menu: restaurant.menu,
    });
  } catch (error) {
    return next({ status: 500, message: error.message });
  }
};

const validCommand = (arr) => {
  return arr.every((el) => (el.id || el._id) && el.qtd);
};

const createTable = async (req, res, next) => {
  // (getToken-middleware)
  try {
    const { hash, name } = req.body;
    const { _id } = req.payload;
    const restaurant = await Restaurant.findById(_id, '-password');
    const dTable = restaurant.tables.find(
      (t) => t.hash === hash || t.name === name
    );
    if (dTable) return next({ message: 'Table already exists' });

    const result = await Restaurant.updateOne(
      { _id },
      { $push: { tables: { hash, name, commands: [] } } }
    );
    return res.status(201).send({ message: 'New table created', result });
  } catch (error) {
    return next({ status: 500, message: error.message });
  }
};

const createCommand = async (req, res, next) => {
  try {
    const { route, table } = req.params;
    const restaurant = await Restaurant.findOne({ route });
    if (!restaurant) return next({ message: 'Restaurant not found!' });
    const dTable = restaurant.tables.find((t) => t.hash === table);
    if (!dTable) return next({ message: 'Table not found' });
    const { command, date } = req.body;
    const isValidCommand = validCommand(command);
    if (!isValidCommand) return next({ message: 'Command invalid' });
    dTable.commands.push({ command, date });
    await Restaurant.updateOne(
      { _id: restaurant._id, 'tables.hash': table },
      {
        $push: {
          'tables.$.commands': { $each: [{ command, date }], $position: 0 },
        },
      }
    );

    return res.status(201).send({
      message: 'New command added in the table',
      restaurant,
      command,
      table,
    });
  } catch (error) {
    return next({ status: 500, message: error.message });
  }
};

const addItemMenu = async (req, res, next) => {
  try {
    const { id, ingredients, name, pic, price } = req.body;
    const { _id } = req.payload;
    const restaurant = await Restaurant.findById(_id);
    if (restaurant.menu.some((el) => el.id === id))
      return next({ message: 'The item already exists.' });

    const result = await Restaurant.updateOne(
      { _id },
      { $push: { menu: { id, ingredients, name, pic, price } } }
    );
    return res.status(201).send({ message: 'Item add to Menu', result });
  } catch (error) {
    return next({ status: 500, message: error.message });
  }
};

const updateMenu = async (req, res, next) => {
  try {
    const { menu } = req.body;
    const { _id } = req.payload;
    const restaurant = await Restaurant.findById(_id, '-password');
    restaurant.menu = menu;
    await restaurant.save();
    return res.status(201).send({ message: 'Menu updated', restaurant });
  } catch (error) {
    return next({ status: 500, message: error.message });
  }
};

const clearTable = async (req, res, next) => {
  try {
    const { hash } = req.params;
    const { _id } = req.payload;
    await Restaurant.updateOne(
      { _id, 'tables.hash': hash },
      { 'tables.$.commands': [] }
    );

    return res.status(201).send({
      message: 'Table clear',
      table: hash,
    });
  } catch (error) {
    return next({ status: 500, message: error.message });
  }
};

const editItemMenu = async (req, res, next) => {
  try {
    const { id, route: pRoute } = req.params;
    const { _id, route } = req.payload;
    const { ingredients, name, pic, price } = req.body;
    if (!ingredients || !name || !pic || !price)
      return next({
        status: 400,
        message: 'Field: ingredients, name, pic, price are requireds',
      });
    if (route !== pRoute)
      return next({
        status: 409,
        message: 'Route not match',
      });

    const result = await Restaurant.updateOne(
      { _id, 'menu.id': id },
      { 'menu.$': { id, name, pic, ingredients, price } }
    );

    return res.status(200).send({
      message: result?.modifiedCount
        ? 'Item updated!'
        : 'This items is already updated!',
    });
  } catch (error) {
    return next({ status: 500, message: error.message });
  }
};

const deleteItemMenu = async (req, res, next) => {
  try {
    const { route: pRoute, id } = req.params;
    const { _id, route } = req.payload;
    if (pRoute !== route)
      return next({
        status: 409,
        message: 'Route not match',
      });
    const result = await Restaurant.updateOne(
      { _id, 'menu.id': id },
      { $pull: { menu: { id } } }
    );
    return res.status(200).send({
      message: result?.modifiedCount
        ? 'Item removed!'
        : 'This item do not exist!',
    });
  } catch (error) {
    return next({ status: 500, message: error.message });
  }
};

const deleteTable = async (req, res, next) => {
  try {
    const { route: pRoute, hash } = req.params;
    const { _id, route } = req.payload;
    if (route !== pRoute)
      return next({ status: 409, message: 'Table can not be deleted' });
    const result = await Restaurant.updateOne(
      { _id, 'tables.hash': hash },
      { $pull: { tables: { hash } } }
    );
    return res.status(200).send({
      message: result?.modifiedCount
        ? 'Table removed!'
        : 'This table do not exist!',
    });
  } catch (error) {
    console.log(error.message);
    return next({ status: 500, message: error.message });
  }
};

module.exports = {
  goRegister,
  goLogin,
  getRoute,
  getTable,
  getTableByHash,
  getMenu,
  createCommand,
  createTable,
  addItemMenu,
  updateMenu,
  clearTable,
  editItemMenu,
  deleteItemMenu,
  deleteTable,
};
