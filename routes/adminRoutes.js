const express =  require("express");
const { auth } = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");
const { getAllDoctors, getAllUser, userApprove } = require("../controllers/adminController");
const { updateLastActive } = require("../middleware/lastActiveMiddleware");

const route =  express.Router();


route.get("/get-all-doctor-profile",auth,checkRole("admin"),updateLastActive,getAllDoctors)
route.get("/get-all-users-profile",auth,checkRole("admin"),updateLastActive,getAllUser)
route.put("/:userId/user-approve",auth,checkRole("admin"),updateLastActive,userApprove)

module.exports=route;