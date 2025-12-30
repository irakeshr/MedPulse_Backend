const express =  require("express");
const { auth } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");
const { UpdateUserProfile } = require("../controllers/userController");

const route = express.Router();

route.post("/update-profile",auth,upload.single("profileImage"),UpdateUserProfile)

module.exports =route;