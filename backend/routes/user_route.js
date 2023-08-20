const express = require('express');
const router = express.Router();
const users = require('../controllers/user_controller.js');
const authorize = require('../auth/authorize.js');


// Get users
router.get("/", authorize.loggedIn, users.findAll);

// Generate a token
router.get('/token', authorize.loggedIn, users.generateToken);

// Get user by email
router.get('/email/:email', authorize.loggedIn, users.findUserByEmail);

// Create a user
router.post('/', authorize.loggedIn, authorize.admin, users.addUser);

// Get single user
router.get('/:id', authorize.loggedIn, users.findUser);

// Update a user
router.put('/:id', authorize.loggedIn, authorize.admin, users.updateUser);

// Delete a user
router.delete('/:id', authorize.loggedIn, authorize.admin, users.deleteUser);


module.exports = router;