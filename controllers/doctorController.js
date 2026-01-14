const { url } = require("../config/cloudinary");
const DoctorSchema = require("../models/DoctorProfile");
const uploadFromBuffer = require("../utils/uploadFromBuffer");
const PatientSchema= require('../models/Patient')


const postProfileDetails = async (req, res) => {
  try {
    const { id } = req.user;
    const {
      displayName,
      specialization,
      qualifications,
      experienceYears,
      licenseNumber,
      contactNumber,
      profileBio,
    } = req.body;
    if (!displayName || !specialization || !licenseNumber) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields(Name,Specialization,License Number)",
      });
    }

    if (req.file) {
      const uploadedResult = await uploadFromBuffer(req.file.buffer);
      imageUrl = uploadedResult.secure_url;
    }

    const DoctorDetails = {
      displayName,
      qualifications,
      experienceYears,
      profileBio,
      contactNumber,
      licenseNumber,
      specialization,
    };
    if (req.file) {
      const uploadedResult = await uploadFromBuffer(req.file.buffer);
      DoctorDetails.profileImage = uploadedResult.secure_url;
    }
    // Find the existing doctor profile to check the current license number
    const existingProfile = await DoctorSchema.findOne({ user: id });

    // If the license number has changed, set verificationStatus to 'pending'
    if (existingProfile && existingProfile.licenseNumber !== licenseNumber) {
      DoctorDetails.verificationStatus = "pending";
    }

    const updatedProfile = await DoctorSchema.findOneAndUpdate(
      { user: id },
      {
        $set: DoctorDetails,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "profile Sended successfully, Wait for the Verification..!",
      profile: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const getDoctorProfile = async (req, res) => {
  try {
    const DoctorProfile = await DoctorSchema.findOne({ user: req.user.id });
    if (!DoctorProfile) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Doctor profile fetched successfully.",
      DoctorProfile,
      role: req.user.role,
    });
  } catch (error) {
    console.error("Error fetching Doctor profile:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const checkDoctorStatus = async (req, res) => {
  try {
    const { id } = req.user;
    const doctor = await DoctorSchema.findOne({ user: id }).lean();

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor profile not found." });
    }

    const isProfileComplete =
      doctor.licenseNumber && doctor.qualifications && doctor.specialization;

    if (isProfileComplete) {
      if (doctor.verificationStatus === "verified") {
        return res.status(200).json({
          success: true,
          message: "Doctor verification is complete.",
          isVerified: true,
        });
      } else {
        return res.status(200).json({
          success: true,
          message:
            "Your profile is under review and verification is in progress.",
          isProfileComplete: true,
        });
      }
    } else {
      return res.status(200).json({
        success: true,
        message: "Doctor profile is incomplete.",
        isProfileComplete: false,
      });
    }
  } catch (error) {
    console.error("Error checking doctor status:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

const getDoctorPosts = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const doctorProfile = await DoctorSchema.findOne({ user: doctorId })
      .populate({
        path: "reviewQueue",
        populate: {
          path: "author",
         
        },
      });

    if (!doctorProfile) {
 return res.status(404).json({
 success: false,
 message: "Doctor profile not found.",
      });
    }

    const userIds = doctorProfile.reviewQueue.map((p) => p.author?._id).filter(Boolean);

    const patients = await PatientSchema.find({ user: { $in: userIds } })
 .select("user profileImage")
 .lean();

    const patientMap = {};
    patients.forEach((p) => {
 patientMap[p.user.toString()] = p.profileImage;
    });

    const postsWithAuthorProfile = doctorProfile.reviewQueue.map((post) => {
      if (post.isAnonymous) {
        return {
          ...post.toObject(), // Convert Mongoose document to plain object
          author: {
            profileImage: "",
            username: "Anonymous",
            role: post.author?.role,
          },
        };
      } else {
        return {
          ...post.toObject(), // Convert Mongoose document to plain object
          author: {
            ...post.author.toObject(), // Convert Mongoose document to plain object
            profileImage: patientMap[post.author?._id?.toString()] || null,
          },
        };
      }
    });

    return res.status(200).json({
      success: true,
      posts: postsWithAuthorProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  postProfileDetails,
  getDoctorProfile,
  checkDoctorStatus,
  getDoctorPosts,
};
