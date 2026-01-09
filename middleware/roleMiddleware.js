
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
     if (!req.role) {
      return res.status(401).json({ message: "Unauthorized: No role found" });
    }

     if (allowedRoles.includes(req.role)) {
     
      next();
    } else {
      
      return res.status(403).json({ message: "Access Denied: Insufficient permissions" });
    }
  };
};

module.exports = checkRole;