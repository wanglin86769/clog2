const express = require('express');
const router = express.Router();
const logbooks = require('../controllers/logbook_controller.js');
const authorize = require('../auth/authorize.js');


// Get logbooks
router.get("/", logbooks.findAll);

// Get logbooks with detailed information
router.get("/detail", logbooks.findAllDetail);

// Create a logbook
router.post('/', authorize.loggedIn, authorize.admin, logbooks.addLogbook);

// Get single logbook
router.get('/:id', logbooks.findLogbook);

// Update a logbook
router.put('/:id', authorize.loggedIn, authorize.admin, logbooks.updateLogbook);

// Delete a logbook
router.delete('/:id', authorize.loggedIn, authorize.admin, logbooks.deleteLogbook);


module.exports = router;