const Comment = require('../models/Comment')
const Patient = require('../models/Patient')
const DoctorProfile = require('../models/DoctorProfile')

 const createComment = async (req, res) => {
    try {
        const { postId, content, parentCommentId } = req.body;
        const author = req.user.id;
        const authorRole = req.user.role;

        if (!postId || !content) {
            return res.status(400).json({ success: false, message: "Post ID and content are required." });
        }

        const newComment = new Comment({
            post: postId,
            author,
            authorRole,
            content,
            parentCommentId: parentCommentId || null,
        });

        const savedComment = await newComment.save();

        // Optionally, update post's comment count or doctor's stats if applicable
        // For example, if a doctor comments on a post in their reviewQueue, move it to solvedCases

        return res.status(201).json({ success: true, message: "Comment created successfully.", comment: savedComment });

    } catch (error) {
        console.error("Error creating comment:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

const getCommentsByPostId = async (req, res) => {
    try {
        const { postId } = req.params;

        const comments = await Comment.find({ post: postId }).populate({
            path: 'author',
            select: 'username role',
        }).sort({ createdAt: 1 }).lean();

        const authorIds = comments.map((comment) => comment.author._id);

        const patients = await Patient.find({ user: { $in: authorIds } })
            .select("user profileImage")
            .lean();

        const doctors = await DoctorProfile.find({ user: { $in: authorIds } })
            .select("user profileImage")
            .lean();

        const profileImageMap = {};
        patients.forEach((p) => {
            profileImageMap[p.user.toString()] = p.profileImage;  // very important we use often.
        });
        doctors.forEach((d) => {
            profileImageMap[d.user.toString()] = d.profileImage;
        });

        const commentsWithProfileImages = comments.map((comment) => {
            const profileImage = profileImageMap[comment.author._id.toString()] || null;
            return {
                ...comment,
                author: { ...comment.author, profileImage },
            };
        });
console.table(commentsWithProfileImages)
        return res.status(200).json({ success: true, message: "Comments fetched successfully.", comments: commentsWithProfileImages });

    } catch (error) {
        console.error("Error fetching comments:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
module.exports = { createComment, getCommentsByPostId };
