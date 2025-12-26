const Post = require("../models/Post");
const DoctorProfile = require("../models/DoctorProfile");
const cloudinary = require("../config/cloudinary");

// Cloudinary stream helper
const uploadFromBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "posts" },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

const userPost = async (req, res) => {
  try {
    const { title, description, stream, tag, isAnonymous } = req.body;

    //Validation FIRST
    if (!title || !description || !stream) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

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
      tags: tag ? [tag] : [],
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
