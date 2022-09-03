const express = require('express');
const router = express.Router();
const tags = require('../controllers/tag_controller.js');
const authorize = require('../auth/authorize.js');


// Get tags
router.get("/", tags.findAll);

// Create a tag
router.post('/', authorize.loggedIn, authorize.admin, tags.addTag);

// Get single tag
router.get('/:id', tags.findTag);

// Update a tag
router.put('/:id', authorize.loggedIn, authorize.admin, tags.updateTag);

// Delete a tag
router.delete('/:id', authorize.loggedIn, authorize.admin, tags.deleteTag);


module.exports = router;