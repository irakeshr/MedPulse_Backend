const express =require('express');
const { userPost, getPost, likePost } = require('../controllers/postController');
const { auth } = require('../middleware/authMiddleware');
const upload = require('../middleware/multerMiddleware');

const route=express.Router();

route.post("/user-post",auth,upload.single("image"),userPost);
route.get("/get-post",auth,getPost);
route.post("/like-unlike",auth,likePost);


module.exports=route;