const express = require('express');
const userController = require('../controllers/user');

const router = express.Router();

router.get('/user/:id', userController.getUserById);

router.get('/clientNames', userController.getClientNames);

router.post('/user', userController.createUser);

router.put('/user/:id', userController.updateUser);

module.exports = router;
