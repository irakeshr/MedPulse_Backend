const Post = require("../models/Post");
const DoctorProfile = require("../models/DoctorProfile");

const checkMedicalContent = require("../utils/medicalChecker");
const uploadFromBuffer = require("../utils/uploadFromBuffer");
const User = require("../models/User");

// Cloudinary stream helper hello world

const userPost = async (req, res) => {
  try {
    const { title, description, stream, tags } = req.body;

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
        message: "Only medical-related posts are allowed",
      });
    }

    //Validation FIRST

    let imageUrl = null;

    // Upload image ONLY if exists
    console.log("buffer image", req.file.buffer);

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
      isAnonymous: req.body.isAnonymous === "true",
      status: "open",
    });

    const savedPost = await newPost.save();
    const count = await Post.countDocuments({ author: req.user.id });

    await User.findByIdAndUpdate(req.user.id, { "stats.postCount": count });

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
    console.log(savedPost);

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

const getPost = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate({
        path: "author",
        select: "username profilePicture role",
      })
      .sort({ createdAt: -1 }); // Sort by newest first

    const modifiedPosts = posts.map((post) => {
      if (post.isAnonymous) {
        post.author = {
          username: "Anonymous",
          profilePicture:
            "https://res.cloudinary.com/dtu7f73yq/image/upload/v1709743789/anonymous_profile_picture.png",
          role: post.author?.role,
        };
      }
      return post;
    });

    return res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      modifiedPosts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

  const likePost = async (req, res) => {
    try {
      const userId = req.user.id;
      const {postId } = req.body;
      console.log("Body=>>>>>>>>>>>>>>>>>",req)
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const alreadyLiked = post.likedBy.includes(userId); // Corrected method name
      if (alreadyLiked) {
        post.likedBy.pull(userId); // Corrected property name
        post.likesCount -= 1;
      } else {
        post.likedBy.push(userId);
        post.likesCount += 1;
      }

      await post.save();
      return res.status(200).json({
        success: true,
        postId,
        likesCount: post.likesCount,
        liked: !alreadyLiked,
      })


    } catch (error) {
      res.status(500).json({ message: "Like failed", error: error.message });
    }
  };

module.exports = { userPost, getPost,likePost };
