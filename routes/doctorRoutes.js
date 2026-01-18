const express = require("express");
const { auth } = require('../middleware/authMiddleware');
const update = require("../middleware/multerMiddleware");
const { postProfileDetails, getDoctorProfile, checkDoctorStatus, getDoctorPosts } = require("../controllers/doctorController");
const checkRole = require("../middleware/roleMiddleware");
const { updateLastActive } = require("../middleware/lastActiveMiddleware");

const Route = express.Router();

Route.post("/profile",auth,checkRole("doctor"),updateLastActive,update.single("profileImage"),postProfileDetails)
Route.get("/get-profile",auth,checkRole("doctor"),updateLastActive,getDoctorProfile);
Route.get("/doctor-status",auth,checkRole("doctor"),updateLastActive,checkDoctorStatus);
Route.get("/get-doctor-posts",auth,checkRole("doctor"),updateLastActive,getDoctorPosts);

module.exports=Route