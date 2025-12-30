const Patients = require("../models/Patient");
const User = require("../models/User");
const uploadFromBuffer = require("../utils/uploadFromBuffer");

const UpdateUserProfile = async (req, res) => {
  try {
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
    const userId = req.user.id; // Assuming req.user.id contains the User ID
   

    // Upload image ONLY if exists
     let imageUrl = null;
    if (req.file) {
      const uploadResult = await uploadFromBuffer(req.file.buffer);
      imageUrl = uploadResult.secure_url;
    }

    // Find the patient profile associated with the user ID
    const patientProfile = await Patients.findOneAndUpdate(
      { user: userId },
      {
        displayName,
        bio,
        location,
        chronicConditions,
        allergies,
        healthTags,
        bloodGroup,
        dateOfBirth,
        profileImage:imageUrl
      },
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

module.exports = { UpdateUserProfile };
