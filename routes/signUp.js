const express = require('express');
const admin = require('firebase-admin');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const { SIGN_UP_ROUTE } = require('./constants');

const router = express.Router();

router.post(SIGN_UP_ROUTE, (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  User.create(
    {
      _id: new mongoose.Types.ObjectId(),
      firstName,
      lastName,
      email,
    },
    (error, mongoUser) => {
      if (error) res.status(400).send(error);
      else {
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
