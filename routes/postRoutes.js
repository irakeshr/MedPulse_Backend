const express =require('express');
const { userPost, getPost, likePost, addComment, getCommentsByPost } = require('../controllers/postController');
const { auth } = require('../middleware/authMiddleware');
const upload = require('../middleware/multerMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const { getCommentsByPostId } = require('../controllers/commentController');
const { updateLastActive } = require('../middleware/lastActiveMiddleware');

const route=express.Router();

route.post("/user-post",auth,checkRole("patient"),updateLastActive,upload.single("image"),userPost);
route.get("/get-post",auth,checkRole("patient"),updateLastActive,getPost);
route.post("/like-unlike",auth,updateLastActive,likePost);
route.post("/:postId/comments",auth, updateLastActive, addComment);
route.post("/:postId/get-comments",auth,updateLastActive,getCommentsByPostId);


module.exports=route;