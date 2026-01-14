const express = require("express");
const { auth } = require('../middleware/authMiddleware');
const update = require("../middleware/multerMiddleware");
const { postProfileDetails, getDoctorProfile, checkDoctorStatus, getDoctorPosts } = require("../controllers/doctorController");
const checkRole = require("../middleware/roleMiddleware");

const Route = express.Router();

Route.post("/profile",auth,checkRole("doctor"),update.single("profileImage"),postProfileDetails)
Route.get("/get-profile",auth,checkRole("doctor"),getDoctorProfile);
Route.get("/doctor-status",auth,checkRole("doctor"),checkDoctorStatus);
Route.get("/get-doctor-posts",auth,checkRole("doctor"),getDoctorPosts);

module.exports=Route