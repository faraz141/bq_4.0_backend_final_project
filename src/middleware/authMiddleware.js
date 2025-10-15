const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const Staff = require("../models/staffModel");
const Doctor = require("../models/doctorModel");

exports.authenticate = async (req, res, next) => {
  const header = req.header("Authorization");
  if (!header) return res.status(401).json({ message: "No token provided" });

  const token = header.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user;

    // Find user based on userType from token
    if (decoded.userType === "staff") {
      user = await Staff.findById(decoded.id).select("-password");
    } else if (decoded.userType === "doctor") {
      user = await Doctor.findById(decoded.id).select("-password");
    } else {
      user = await User.findById(decoded.id).select("-password");
    }

    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.user = user;
    req.userType = decoded.userType;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // For doctors and staff, use userType instead of role
    const userRole = req.user.role || req.userType;

    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
