const DoctorSchema = require("../models/DoctorProfile");
const Patient = require("../models/Patient");
const postsSchema = require("../models/Post")
const commentSchema = require("../models/Comment")

const User = require("../models/User");

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await DoctorSchema.find().populate("user", "email");

    if (!doctors || doctors.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No doctors found." });
    }

    return res
      .status(200)
      .json({
        success: true,
        message: "All Doctor Profiles fetched successfully.",
        doctors,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Server Error!!",
        error: error.message,
      });
  }
};

const getAllUser = async (req, res) => {
  try {
    const allUsers = await User.find().select("-password");

    // Calculate the start and end dates for the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const suspended = await User.countDocuments({ "stats.approved": "suspended" });

    // Count users created within the current month
    const usersThisMonthCount = await User.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // total count of users

    const totalCount = await User.countDocuments();
    const usersCount = {
      totalCount,
      usersThisMonthCount,
      suspendedCount: suspended,
    };

   

    if (!allUsers || allUsers.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Users not found!!" });
    }

    return res
      .status(200)
      .json({
        success: true,
        message: "Data fetched successfully!!",
        allUsers,
        usersCount,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "server error", error });
  }
};

const userApprove = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // 'active', 'suspended'

    console.log(userId,status)
    if (!userId || !status) {
      return res.status(400).json({ success: false, message: "User ID and status are required." });
    }

  const updatedUser = await User.findByIdAndUpdate(
  userId,
  {
    $set: {
      "stats.approved": status
    }
  },
  { new: true, runValidators: true }
).select("-password");


    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: `User status updated to ${status} successfully.`,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
 

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const {username} = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }

    // Delete user from User collection
    const userDeleteResult = await User.deleteOne({ _id: userId });
    // Delete user from Patient collection (if exists)
    await Patient.deleteOne({ user: userId });
    // Delete user from DoctorProfile collection (if exists)
    await DoctorSchema.deleteOne({ user: userId });
    
    await postsSchema.deleteMany({author: userId}); //delete all Posts

    await commentSchema.deleteMany({author:userId}) //delete all comments

    if (userDeleteResult.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, message: `${username} and associated profiles deleted successfully.` });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
}
module.exports = { getAllDoctors, getAllUser, userApprove, deleteUser };