const errorHandler = require('../middlewares/errorHandler');
const getToken = require('../middlewares/getToken');
const notImplemented = require('../middlewares/notImplemented');
const restaurant = require('../controllers/restaurantController');
// const hostCont = require('../controllers/hostController');
// const prodCont = require('../controllers/productController');

const router = require('express').Router();

router.get('/', (_req, res) => res.status(200).json({ message: 'Server Up' }));
router.get('/route', getToken, restaurant.getRoute);
router.get('/table', getToken, restaurant.getTable);
router.get('/table/:hash', getToken, restaurant.getTableByHash);
router.get('/:route/menu', restaurant.getMenu);

router.post('/login', restaurant.goLogin);
router.post('/new-table', getToken, restaurant.createTable);
router.post('/new-menu', getToken, restaurant.updateMenu);
router.post('/add-to-menu', getToken, restaurant.addItemMenu);
router.post('/:route/:table', restaurant.createCommand);

router.put('/:route/menu/:id', getToken, restaurant.editItemMenu);

router.delete('/table/:hash', getToken, restaurant.clearTable);
router.delete('/:route/menu/:id', getToken, restaurant.deleteItemMenu);
router.delete('/:route/table/:hash', getToken, restaurant.deleteTable);

router.use(notImplemented);
router.use(errorHandler);
module.exports = router;
