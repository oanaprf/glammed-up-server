/* eslint-disable no-console */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv/config');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get('/', (_, res) => res.json({ ok: 'ok' }));

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch(err => console.error(err));
mongoose.connection.on('error', err => {
  console.error(err);
});

app.listen(port, err => console.log(err || `server listening on port ${port}`));
