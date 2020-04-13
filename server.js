/* eslint-disable no-console */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const getOr = require('lodash/fp/getOr');

const signUpRouter = require('./routes/signUp');
const { SIGN_UP_ROUTE } = require('./routes/constants');
require('dotenv/config');

const app = express();
const port = process.env.PORT;

admin.initializeApp({
  credential: admin.credential.cert({
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  }),
  databaseURL: process.env.FIREBASEDB_URI,
});

const authMiddleware = (req, res, next) => {
  const authToken = getOr(undefined, ['headers', 'authorization'], req);
  if (authToken) {
    admin
      .auth()
      .verifyIdToken(authToken)
      .then(() => next())
      .catch(() => res.status(403).send('Unauthorized'));
  } else if (req.method === 'POST' && req.url === SIGN_UP_ROUTE) {
    next();
  } else {
    res.status(403).send('Unauthorized');
  }
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(authMiddleware);
app.use(signUpRouter);

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
