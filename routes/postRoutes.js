const express =require('express');
const { userPost, getPost, likePost, addComment, getCommentsByPost } = require('../controllers/postController');
const { auth } = require('../middleware/authMiddleware');
const upload = require('../middleware/multerMiddleware');
const checkRole = require('../middleware/roleMiddleware');

const route=express.Router();

route.post("/user-post",auth,checkRole("patient"),upload.single("image"),userPost);
route.get("/get-post",auth,checkRole("patient"),getPost);
route.post("/like-unlike",auth,likePost);
route.post("/:postId/comments",auth ,addComment);
route.post("/:postId/get-comments",auth,getCommentsByPost);


module.exports=route;