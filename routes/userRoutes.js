const express =  require("express");
const { auth } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");
const { UpdateUserProfile, getUserProfile } = require("../controllers/userController");

const route = express.Router();

route.post("/update-profile",auth,upload.single("profileImage"),UpdateUserProfile)
route.get("/get-profile",auth,getUserProfile)

module.exports =route;