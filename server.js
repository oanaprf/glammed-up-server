/* eslint-disable no-console */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const firebaseAdmin = require('firebase-admin');
const getOr = require('lodash/fp/getOr');

require('dotenv/config');

const app = express();
const port = process.env.PORT;

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert({
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  }),
  databaseURL: process.env.FIREBASEDB_URI,
});

const authMiddleware = (req, res, next) => {
  const authToken = getOr(undefined, ['headers', 'authorization'], req);
  if (authToken) {
    firebaseAdmin
      .auth()
      .verifyIdToken(authToken)
      .then(() => next())
      .catch(() => res.status(403).send('Unauthorized'));
  } else {
    res.status(403).send('Unauthorized');
  }
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(authMiddleware);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch(err => console.error(err));
mongoose.connection.on('error', err => {
  console.error(err);
});

app.get('/', (_, res) => res.json({ ok: 'ok' }));

app.listen(port, err => console.log(err || `server listening on port ${port}`));
