const User = require("../models/UserModel");
const Staff = require("../models/staffModel");
const Doctor = require("../models/doctorModel");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  age: Joi.number().optional(),
  gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
  contact: Joi.string().optional(),
  address: Joi.string().optional(),
  role: Joi.string()
    .valid("admin", "patient")
    .optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.registerUser = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { name, email, password, age, gender, contact, address, role } = req.body;
    
    // Check if email exists in any collection
    const userExists = await User.findOne({ email });
    const staffExists = await Staff.findOne({ email });
    const doctorExists = await Doctor.findOne({ email });
    
    if (userExists || staffExists || doctorExists)
      return res.status(400).json({ message: "Email already exists" });

    const user = new User({ 
      name, 
      email, 
      password, 
      age, 
      gender, 
      contact, 
      address, 
      role: role || "patient" 
    });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    
    // Try to find user in User collection (admin/patient)
    let user = await User.findOne({ email });
    let userType = 'user';
    
    // If not found, try Staff collection
    if (!user) {
      user = await Staff.findOne({ email });
      userType = 'staff';
    }
    
    // If not found, try Doctor collection
    if (!user) {
      user = await Doctor.findOne({ email });
      userType = 'doctor';
    }
    
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, userType },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, role: user.role, userType },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
