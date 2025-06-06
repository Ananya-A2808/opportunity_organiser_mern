const express = require('express');
const router = express.Router();
const { fetchEmails, getCategories, getOpportunitiesByCategory } = require('../controllers/emailController');

router.post('/fetch', fetchEmails);
router.get('/categories', getCategories);
router.get('/opportunities/:category', getOpportunitiesByCategory);

module.exports = router;
