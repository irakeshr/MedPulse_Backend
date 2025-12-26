const express =require('express');
const { userPost } = require('../controllers/postController');
const { auth } = require('../middleware/authMiddleware');
const upload = require('../middleware/multerMiddleware');

const route=express.Router();

route.post("/user-post",auth,upload.single("image"),userPost);


module.exports=route;