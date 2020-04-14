const express = require('express');
const admin = require('firebase-admin');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const compose = require('lodash/fp/compose');
const entries = require('lodash/fp/entries');
const reduce = require('lodash/fp/reduce');
const getOr = require('lodash/fp/getOr');

const User = require('../models/user');
const { USER } = require('../models/constants');
const { ROUTES, ERRORS } = require('./constants');

const router = express.Router();

const getErrors = getOr({}, 'errors');

const getErrorPayload = compose(
  reduce(
    (result, [key, { message }]) => ({
      ...result,
      errors: { ...result.errors, [key]: message },
    }),
    {}
  ),
  entries,
  getErrors
);

router.post(ROUTES.SIGN_UP, (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  User.create(
    {
      _id: new mongoose.Types.ObjectId(),
      firstName,
      lastName,
      email,
    },
    (error, mongoUser) => {
      if (error) {
        if (error.code === 11000 && [USER.FIELDS.EMAIL] in error.keyValue) {
          res.status(400).send({
            errors: { [USER.FIELDS.EMAIL]: ERRORS.SIGN_UP.EMAIL_ALREADY_EXISTS },
          });
        } else {
          res.status(400).send(getErrorPayload(error));
        }
      } else {
        admin
          .auth()
          .createUser({
            uid: `${mongoUser._id}`,
            email,
            password: bcrypt.hashSync(password, 12),
          })
          .then(() => res.status(201).send({ message: 'User successfully created' }))
          .catch(err => res.status(400).send(err));
      }
    }
  );
});

module.exports = router;
