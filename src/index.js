require('dotenv/config');
const express = require('express');
const cors = require('cors');
const router = require('./routes');
const dbConn = require('./models/dbConn');

const app = express();
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());

app.use(router);

const port = process.env.PORT || 3001;

dbConn()
  .then((r) => console.log(r))
  .catch((err) => console.log(err))
  .finally(() => {
    app.listen(port, () => {
      console.log('Server Up na port %s', port);
    });
  });
