const User = require("../models/User");

exports.updateLastActive = async (req, res, next) => {
  try {
    if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, {
        lastActive: new Date()
      });
    }
    next();
  } catch (error) {
    next();
  }
};
