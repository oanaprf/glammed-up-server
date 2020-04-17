/* eslint-disable no-console */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const getOr = require('lodash/fp/getOr');

const userRouter = require('./api/routes/user');
const reviewRouter = require('./api/routes/review');
const serviceRouter = require('./api/routes/service');
const { ERROR } = require('./api/routes/constants');
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
      .catch(() => res.status(401).send({ error: ERROR.APP.UNAUTHORIZED }));
  } else if (req.method === 'POST' && req.url === '/user') {
    next();
  } else {
    res.status(403).send({ error: ERROR.APP.UNAUTHORIZED });
  }
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(authMiddleware);
app.use(userRouter);
app.use(reviewRouter);
app.use(serviceRouter);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .catch(err => console.error(err));
mongoose.connection.on('error', err => {
  console.error(err);
});

app.listen(port, err => console.log(err || `server listening on port ${port}`));
