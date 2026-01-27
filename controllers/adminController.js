const DoctorSchema = require("../models/DoctorProfile");
const Patient = require("../models/Patient");
const postsSchema = require("../models/Post")
const commentSchema = require("../models/Comment")

const User = require("../models/User");

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await DoctorSchema
      .find()
      .populate("user", "email")
      .sort({ updatedAt: -1 });

    if (!doctors.length) {
      return res.status(404).json({
        success: false,
        message: "No doctors found.",
      });
    }

    // Count verification statuses
    const totalUsersCount = await User.countDocuments();
    const statusCount = {
      pending: 0,
      verified: 0,
      rejected: 0,
      profilePending: 0,
    };

    doctors.forEach((doc) => {
      if (statusCount[doc.verificationStatus] !== undefined) {
        statusCount[doc.verificationStatus]++;
      }
    });

    res.status(200).json({
      success: true,
      message: "All Doctor Profiles fetched successfully.",
      doctors,
      statusCount, //counts here
      userCount:totalUsersCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error!!",
      error: error.message,
    });
  }
};
const getAllUser = async (req, res) => {
  try {
    // Get pagination params from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    // Build filter object (for search/filter functionality)
    const filter = {};

    // Role filter
    if (req.query.role && req.query.role !== 'all') {
      filter.role = req.query.role;
    }

    //  Status filter
    if (req.query.status && req.query.status !== 'all') {
      filter['stats.approved'] = req.query.status;
    }

     if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { username: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Execute paginated query with filter
    const allUsers = await User.find(filter)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Newest first

    // Get total count with same filter (for accurate pagination)
    const totalCount = await User.countDocuments(filter);

    // Calculate monthly stats (only on first page or when requested to optimize)
    let usersThisMonthCount = 0;
    let suspendedCount = 0;

    // Only calculate stats if needed (page 1 or specific query param)
    if (page === 1 || req.query.includeStats === 'true') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Use Promise.all for parallel execution
      [usersThisMonthCount, suspendedCount] = await Promise.all([
        User.countDocuments({
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }),
        User.countDocuments({ "stats.approved": "suspended" })
      ]);
    }

    const usersCount = {
      totalCount: await User.countDocuments(), // Total in database
      filteredCount: totalCount, // Total matching current filter
      usersThisMonthCount,
      suspendedCount
    };

    // Pagination metadata
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      limit,
      totalCount,
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1
    };

    if (!allUsers || allUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found",
        pagination,
        usersCount
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      allUsers,
      usersCount,
      pagination
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
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