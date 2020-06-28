const admin = require('firebase-admin');
const {
  Types: { ObjectId },
} = require('mongoose');
// const bcrypt = require('bcrypt');
const isEmpty = require('lodash/fp/isEmpty');

const User = require('../models/user');
const { USER } = require('../models/constants');
const { SUCCESS, ERROR, getBody, getId, mapErrors, getObjectDiff } = require('./constants');

const emailAlreadyExistsError = {
  errors: { [USER.FIELDS.EMAIL]: ERROR.USER.EMAIL_ALREADY_EXISTS },
};
const treatErrors = (res, error) =>
  res
    .status(400)
    .send(
      error.code === 11000 && [USER.FIELDS.EMAIL] in error.keyValue
        ? emailAlreadyExistsError
        : mapErrors(error)
    );

const getUserById = (req, res) => {
  const id = getId(req);
  if (ObjectId.isValid(id)) {
    User.findById(id)
      .then(user => {
        if (user) res.status(200).send(user);
        else res.status(404).send({ error: ERROR.USER.USER_NOT_FOUND });
      })
      .catch(error => res.status(400).send(error));
  } else res.status(400).send({ error: ERROR.USER.USER_ID_NOT_VALID });
};

const getClientNames = (_, res) => {
  User.find({ isProvider: false }, { firstName: 1, lastName: 1 })
    .then(clients => {
      if (clients) res.status(200).send(clients);
      else res.status(404).send({ error: ERROR.USER.USER_NOT_FOUND });
    })
    .catch(error => res.status(400).send(error));
};

const createUser = (req, res) => {
  const { firstName, lastName, email, password, pushToken } = getBody(req);
  const user = new User({ _id: new ObjectId(), firstName, lastName, email, pushToken });
  user
    .save()
    .then(mongoUser =>
      admin
        .auth()
        .createUser({
          uid: `${mongoUser._id}`,
          email,
          password,
          // password: bcrypt.hashSync(password, 12),
        })
        .then(() => res.status(201).send(mongoUser))
        .catch(firebaseError => res.status(400).send(firebaseError))
    )
    .catch(mongoError => treatErrors(res, mongoError));
};

const updateUser = (req, res) => {
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
                      res.status(200).send(userToBeUpdated);
                    }
                  })
                  .catch(firebaseError => res.status(400).send(firebaseError));
              } else {
                res.status(200).send(userToBeUpdated);
              }
            })
            .catch(mongoError => treatErrors(res, mongoError));
        } else {
          res.status(200).send({ message: SUCCESS.USER.USER_NOT_CHANGED, data: userToBeUpdated });
        }
      })
      .catch(() => res.status(404).send({ error: ERROR.USER.USER_NOT_FOUND }));
  } else res.status(400).send({ error: ERROR.USER.USER_ID_NOT_VALID });
};

module.exports = { getUserById, getClientNames, createUser, updateUser };
