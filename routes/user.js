const express = require('express');
const admin = require('firebase-admin');
const {
  Types: { ObjectId },
} = require('mongoose');
const bcrypt = require('bcrypt');
const compose = require('lodash/fp/compose');
const entries = require('lodash/fp/entries');
const reduce = require('lodash/fp/reduce');
const getOr = require('lodash/fp/getOr');
const isEqual = require('lodash/fp/isEqual');
const isEmpty = require('lodash/fp/isEmpty');

const User = require('../models/user');
const { USER } = require('../models/constants');
const { ROUTES, SUCCESS, ERROR } = require('./constants');

const router = express.Router();

const getErrors = getOr({}, 'errors');
const getPostErrorPayload = compose(
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

const getBody = getOr({}, 'body');
const getParams = getOr({}, 'params');
const getId = compose(getOr('', 'id'), getParams);

const getObjectDiff = (obj1, obj2) =>
  Object.entries(obj2).reduce(
    (res, [key, value]) => ({
      ...res,
      ...(!isEqual(value, obj1[key]) && { [key]: value }),
    }),
    {}
  );

router.get(`${ROUTES.USER}/:id`, (req, res) => {
  const id = getId(req);
  if (ObjectId.isValid(id)) {
    User.findById(id, (err, user) => {
      if (err) res.status(400).send(err);
      else if (user) res.status(200).send(user);
      else res.status(404).send({ error: ERROR.USER.USER_NOT_FOUND });
    });
  } else res.status(400).send({ error: ERROR.USER.USER_ID_NOT_VALID });
});

router.post(ROUTES.USER, (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  User.create(
    {
      _id: new ObjectId(),
      firstName,
      lastName,
      email,
    },
    (error, mongoUser) => {
      if (error) {
        if (error.code === 11000 && [USER.FIELDS.EMAIL] in error.keyValue) {
          res.status(400).send({
            errors: { [USER.FIELDS.EMAIL]: ERROR.USER.EMAIL_ALREADY_EXISTS },
          });
        } else {
          res.status(400).send(getPostErrorPayload(error));
        }
      } else {
        admin
          .auth()
          .createUser({
            uid: `${mongoUser._id}`,
            email,
            password: bcrypt.hashSync(password, 12),
          })
          .then(() =>
            res.status(201).send({ message: SUCCESS.USER.USER_SUCCESSFULLY_CREATED })
          )
          .catch(err => res.status(400).send(err));
      }
    }
  );
});

router.put(`${ROUTES.USER}/:id`, (req, res) => {
  const id = getId(req);
  if (ObjectId.isValid(id)) {
    const updatedUser = getBody(req);
    User.findById(id)
      .then(userToBeUpdated => {
        const changes = getObjectDiff(userToBeUpdated, updatedUser);
        if (!isEmpty(changes)) {
          Object.assign(userToBeUpdated, changes);
          userToBeUpdated
            .save()
            .then(() => {
              if (USER.FIELDS.EMAIL in changes) {
                admin
                  .auth()
                  .updateUser(id, { email: changes.email })
                  .then(user => {
                    if (user) {
                      res
                        .status(200)
                        .send({ message: SUCCESS.USER.USER_SUCCESSFULLY_UPDATED });
                    }
                  })
                  .catch(err => res.status(400).send(err));
              } else {
                res.status(200).send({ message: SUCCESS.USER.USER_SUCCESSFULLY_UPDATED });
              }
            })
            .catch(error => {
              if (error.code === 11000 && [USER.FIELDS.EMAIL] in error.keyValue) {
                res.status(400).send({
                  errors: { [USER.FIELDS.EMAIL]: ERROR.USER.EMAIL_ALREADY_EXISTS },
                });
              } else {
                res.status(400).send(getPostErrorPayload(error));
              }
            });
        }
      })
      .catch(() => res.status(404).send({ error: ERROR.USER.USER_NOT_FOUND }));
  } else res.status(400).send({ error: ERROR.USER.USER_ID_NOT_VALID });
});

module.exports = router;
