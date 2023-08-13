require('dotenv/config');
const express = require('express');
const router = require('./routes');
const dbConn = require('./models/dbConn');

const app = express();
app.use(express.json());

app.use(router);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log('Server Up na port %s', port);
  dbConn()
    .then((r) => console.log(r))
    .catch((err) => console.log(err));
});
