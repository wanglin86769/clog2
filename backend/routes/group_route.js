const express = require('express');
const router = express.Router();
const groups = require('../controllers/group_controller.js');
const authorize = require('../auth/authorize.js');


// Get groups
router.get("/", groups.findAll);

// Create a group
router.post('/', authorize.loggedIn, authorize.admin, groups.addGroup);

// Get single group
router.get('/:id', groups.findGroup);

// Update a group
router.put('/:id', authorize.loggedIn, authorize.admin, groups.updateGroup);

// Delete a group
router.delete('/:id', authorize.loggedIn, authorize.admin, groups.deleteGroup);


module.exports = router;