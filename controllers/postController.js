const Post = require("../models/Post");
const DoctorProfile = require("../models/DoctorProfile");
 
const checkMedicalContent = require("../utils/medicalChecker");
const uploadFromBuffer = require("../utils/uploadFromBuffer");

// Cloudinary stream helper hello world
 

const userPost = async (req, res) => {
  try {


    const { title, description, stream, tags, isAnonymous } = req.body;

       if (!title || !description || !stream) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields(title,description,stream)",
      });
    }

      const aiContent = `
title: ${title}
description: ${description}
tags: ${tags}
  `;

  const isMedical = await checkMedicalContent(aiContent);

  if (isMedical !== "true") {
    return res.status(400).json({
      message: "Only medical-related posts are allowed"
    });
  }

    //Validation FIRST
 

    let imageUrl = null;

    // Upload image ONLY if exists
    if (req.file) {
      const uploadResult = await uploadFromBuffer(req.file.buffer);
      imageUrl = uploadResult.secure_url;
    }

    // Save post
    const newPost = new Post({
      author: req.user.id,
      title,
      content: description,
      symptomType: stream,
      tags: tags ? tags : [],
      images: imageUrl ? [imageUrl] : [],
      isAnonymous: Boolean(isAnonymous),
      status: "open",
    });

    const savedPost = await newPost.save();

    // Notify doctors
    await DoctorProfile.updateMany(
      {
        specialization: stream,
        verificationStatus: "verified",
      },
      {
        $push: { reviewQueue: savedPost._id },
        $inc: { "stats.pendingReviews": 1 },
      }
    );
    console.log(savedPost)

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: savedPost,
    });

  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = { userPost };
