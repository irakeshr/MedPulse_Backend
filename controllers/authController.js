const User = require("../models/User");
const bcrypt = require("bcryptjs");
const DoctorProfile = require("../models/DoctorProfile"); // Import DoctorProfile model
const jwt = require("jsonwebtoken");
const Patient = require("../models/Patient");

// Helper function to generate Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRE },
  );
};

// REGISTER USER (Handles both Patient & Doctor)

exports.register = async (req, res) => {
  const { email, password, username, role } = req.body;

  try {
    //   Check if email already exists
    let user = await User.findOne({ email });

    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    //   Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    //  Create the user
    //  the role is not provided in the body, it defaults to 'patient' (defined in Schema)
    user = new User({
      username,
      email,
      password: hashPassword,
      role,
    });

    const savedUser = await user.save();

    // If the user is a doctor, create a corresponding DoctorProfile
    if (role === "doctor") {
      const doctorProfile = new DoctorProfile({
        user: savedUser._id,
        // Set default or placeholder values for required fields
        specialization: "N/A", // Default specialization
        fullName: username, // Use username as full name for now
        experienceYears: 0,
        contactNumber: "N/A",
        qualifications: "N/A", // Default experience
        // The licenseNumber is required, so we need to provide a placeholder
        // It's marked as select: false in the schema, so it won't be returned by default
        licenseNumber: "N/A", // Placeholder license number
        consultationFee: 0, // Default consultation fee
      });
      await doctorProfile.save();
    }
    // If the user is a patients, create a corresponding patientProfile
    else if (role == "patient") {
      const patientProfile = new Patient({
        user: savedUser._id,
        displayName: username,
        username: username,
      });

      await patientProfile.save();
    }

    res.status(200).json({
      success: true,
      message: "User successfully created",
      savedUser,
      // Optionally, you might want to return the user data or a token here
      // For now, just a success message
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Internal server error, try again" });
  }
};

// LOGIN USER

exports.login = async (req, res) => {
  const { email, password } = req.body; // Extract explicit credentials only

  try {
    // 1. Find user
    const user = await User.findOne({ email });
    console.log(user);

    // 2. Check if user exists
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 3. Compare Password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // 4. Generate Token
    const token = generateToken(user);

    //  Exclude password from the response
    const { password: userPassword, role, ...rest } = user._doc; // I diStructure the user and store role and the password  into userPassword,...rest

    res.status(200).json({
      success: true,
      message: "Successfully logged in",
      token,
      data: { ...rest },
      role,
      isFirstLogin: false,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to login", error: err.message });
  }
};

exports.TokenValidation = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: user not found",
    });
  }

  const user = await User.findById(req.user.id).select("-password"); // Fetch user data excluding password

  res.status(200).json({
    success: true,
    message: `Welcome user ${user.email}`,
    user: user, // Send the full user object
    role: user.role,
  });
};

exports.googleAuth = async (req, res) => {
  try {
    const { name, email, picture } = req.body;

    let user = await User.findOne({ email });
    let isFirstLogin = false;

    if (!user) {
      isFirstLogin = true;

      const generatedPassword = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(generatedPassword, salt);

      user = await User.create({
        username: name,
        email,
        password: hashedPassword,
        role: "unassigned",
        profilePicture: picture || "",
      });
    }

    const token = generateToken(user);

    const { password, ...safeUser } = user._doc;

    return res.status(200).json({
      success: true,
      message: "Google authentication successful",
      token,
      user: safeUser,
      role: user.role,
      isFirstLogin: user.role === "unassigned" ? true : isFirstLogin,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(500).json({
      success: false,
      message: "Google authentication failed",
      error: error.message,
    });
  }
};

const mongoose = require("mongoose");

exports.setUserRole = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { role } = req.body;
    const userId = req.user.id;

    if (!role || !["patient", "doctor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Valid role is required",
      });
    }

    session.startTransaction();

    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.role = role;
    await user.save({ session });

    if (role === "patient") {
      const exists = await Patient.findOne({ user: userId }).session(session);
      if (!exists) {
        await Patient.create(
          [
            {
              user: userId,
              displayName: user.username,
              username: user.username,
              profileImage: user.profilePicture || "",
            },
          ],
          { session },
        );
      }
    }

    if (role === "doctor") {
      const exists = await DoctorProfile.findOne({ user: userId }).session(
        session,
      );
      if (!exists) {
        await DoctorProfile.create(
          [
            {
              user: userId,
              displayName: user.username,
              username: user.username,
              profileImage: user.profilePicture || "",
              specialization: "General Practitioner",
              contactNumber: "N/A",
              experienceYears: 0, // Default experience
              licenseNumber: "N/A", // Placeholder license number
              consultationFee: 0,
            },
          ],
          { session },
        );
      }
    }

    await session.commitTransaction();

    const updatedUser = await User.findById(userId).select("-password");
    const token = generateToken(updatedUser);

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: updatedUser,
      token,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("setUserRole error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    session.endSession();
  }
};
