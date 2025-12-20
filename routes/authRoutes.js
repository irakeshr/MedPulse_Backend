const express = require('express');
const { register, login, TokenValidation } = require("../controllers/authController");
const { auth } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/validate-token',auth,TokenValidation)

module.exports = router;