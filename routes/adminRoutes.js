const express =  require("express");
const { auth } = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");
const { getAllDoctors } = require("../controllers/adminController");
const { updateLastActive } = require("../middleware/lastActiveMiddleware");

const route =  express.Router();


route.get("/get-all-doctor-profile",auth,checkRole("admin"),updateLastActive,getAllDoctors)

module.exports=route;