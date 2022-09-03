const express = require('express');
const router = express.Router();
const accounts = require('../controllers/account_controller.js');
const authorize = require('../auth/authorize.js');


// Register an account
router.post('/registeraccount', accounts.registerAccount);

// Verify an account
router.post('/verifyaccount/:random', accounts.verifyAccount);

// Update an account
router.post('/updatepassword/:email', accounts.updatePassword);

// Forget password
router.post('/forgetpassword/:email', accounts.forgetPassword);

// Reset password
router.post('/resetpassword/:random', accounts.resetPassword);

// Get accounts
router.get("/", authorize.loggedIn, accounts.findAll);

// Create an account
router.post('/', authorize.loggedIn, authorize.admin, accounts.addAccount);

// Get single account
router.get('/:id', authorize.loggedIn, accounts.findAccount);

// Update an account
router.put('/:id', authorize.loggedIn, authorize.admin, accounts.updateAccount);

// Delete an account
router.delete('/:id', authorize.loggedIn, authorize.admin, accounts.deleteAccount);


module.exports = router;