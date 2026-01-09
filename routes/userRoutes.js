const express =  require("express");
const { auth } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");
const { UpdateUserProfile, getUserProfile } = require("../controllers/userController");
const checkRole = require("../middleware/roleMiddleware");

const route = express.Router();

route.post("/update-profile",auth,checkRole("patient"),upload.single("profileImage"),UpdateUserProfile)
route.get("/get-profile",auth,checkRole("patient"),getUserProfile)

module.exports =route;