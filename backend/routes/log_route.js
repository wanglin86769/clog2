const express = require('express');
const router = express.Router();
const logs = require('../controllers/log_controller.js');
const authorize = require('../auth/authorize.js');


// Run script for test or data conversion
// router.get('/script', logs.runScript);

// Get maximum timestamp of logs in a logbook
router.get('/lastactive', logs.findLastActive);

// Get logs
router.get('/', logs.findLogs);

// Create a log
router.post('/', authorize.loggedIn, logs.createLogFormData);

// Get single log
router.get('/:logId', logs.findLog);

// Update a log
router.put('/:logId', authorize.loggedIn, authorize.canEditLog, logs.updateLogFormData);

// Delete a log
router.delete('/:logId', authorize.loggedIn, authorize.canEditLog, logs.deleteLog);

// Get single attachment
router.get('/attachments/:logId/:fileName', logs.findAttachment);

// Create a rich text image
router.post('/richtext', authorize.loggedInRichText, logs.createRichTextImage);

// Get a rich text image
router.get('/richtext/:year/:month/:day/:fileName', logs.findRichTextImage);


module.exports = router;