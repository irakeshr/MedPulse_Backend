const Patient = require("../models/Patient");
const Patients = require("../models/Patient");
const User = require("../models/User");
const uploadFromBuffer = require("../utils/uploadFromBuffer");

const UpdateUserProfile = async (req, res) => {
  try {
     const userId = req.user.id; // Assuming req.user.id contains the User ID
    const {
      displayName,
      bio,
      location,
      chronicConditions,
      allergies,
      healthTags,
      bloodGroup,
      dateOfBirth,
    } = req.body;

    const updateData = {
      displayName,
      bio,
      location,
      chronicConditions,
      allergies,
      healthTags,
      bloodGroup,
      dateOfBirth,
    };
   
   

    // Upload image ONLY if exists
      
    if (req.file) {
      const uploadResult = await uploadFromBuffer(req.file.buffer);
      updateData.profileImage = uploadResult.secure_url;
    }

    // Find the patient profile associated with the user ID
    const patientProfile = await Patients.findOneAndUpdate(
      { user: userId },
    { $set: updateData },
      { new: true, runValidators: true } // Return the updated document and run schema validators ->
      //  bcoz the auto validate work only once ,when the first creation .
    );

    if (!patientProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Patient profile not found." });
    }

    return res
      .status(200)
      .json({
        success: true,
        message: "Patient profile updated successfully.",
        patientProfile,
      });
  } catch (error) {
    console.error("Error updating patient profile:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
const getUserProfile= async(req,res)=>{
  try {
    const patientProfile = await Patients.findOne({ user: req.user.id });
    if (!patientProfile) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found."
      });
    }
    return res.status(200).json({
      success: true,
      message: "Patient profile fetched successfully.",
      patientProfile,
      role:req.user.role
    });
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
}

module.exports = { UpdateUserProfile ,getUserProfile};
