const express = require('express');
const router = express.Router();
const templates = require('../controllers/template_controller.js');
const authorize = require('../auth/authorize.js');


// Get templates
router.get("/", templates.findAll);

// Create a template
router.post('/', authorize.loggedIn, authorize.admin, templates.addTemplate);

// Get single template
router.get('/:id', templates.findTemplate);

// Update a template
router.put('/:id', authorize.loggedIn, authorize.admin, templates.updateTemplate);

// Delete a template
router.delete('/:id', authorize.loggedIn, authorize.admin, templates.deleteTemplate);


module.exports = router;