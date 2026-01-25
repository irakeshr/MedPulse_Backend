const express = require('express');
const { register, login, TokenValidation, googleAuth, setUserRole } = require("../controllers/authController");
const { auth } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/googleLogin',googleAuth);
router.get('/validate-token',auth,TokenValidation)
router.post('/set-user-role',auth,setUserRole)


module.exports = router;