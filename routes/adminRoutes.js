const express =  require("express");
const { auth } = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");
const { getAllDoctors, getAllUser, userApprove, deleteUser } = require("../controllers/adminController");
const { updateLastActive } = require("../middleware/lastActiveMiddleware");

const route =  express.Router();


route.get("/get-all-doctor-profile",auth,checkRole("admin"),updateLastActive,getAllDoctors)
route.get("/get-all-users-profile",auth,checkRole("admin"),updateLastActive,getAllUser)
route.put("/:userId/user-approve",auth,checkRole("admin"),updateLastActive,userApprove)
route.delete("/:userId/delete-user",auth,checkRole("admin"),updateLastActive,deleteUser)

module.exports=route;