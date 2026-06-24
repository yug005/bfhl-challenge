const express = require('express');
const router = express.Router();
const { handlePost, handleGet } = require('../controllers/bfhl.controller');
const validateRequest = require('../middleware/validateRequest');

router.get('/', handleGet);
router.post('/', validateRequest, handlePost);

module.exports = router;
