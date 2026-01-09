const express =require('express');
const { userPost, getPost, likePost, addComment, getCommentsByPost } = require('../controllers/postController');
const { auth } = require('../middleware/authMiddleware');
const upload = require('../middleware/multerMiddleware');
const checkRole = require('../middleware/roleMiddleware');

const route=express.Router();

route.post("/user-post",auth,checkRole("patient"),upload.single("image"),userPost);
route.get("/get-post",auth,checkRole("patient"),getPost);
route.post("/like-unlike",auth,checkRole("patient"),likePost);
route.post("/:postId/comments",auth,checkRole("patient"),addComment);
route.post("/:postId/get-comments",auth,checkRole("patient"),getCommentsByPost);


module.exports=route;