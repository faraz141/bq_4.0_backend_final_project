const Department = require("../models/deparmentModel");

exports.getDepartments = async (req, res) => {
  const departments = await Department.find();
  res.json(departments);
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const dept = new Department({
      name,
      code,
      description,
      createdBy: req.user._id,
    });
    await dept.save();
    res.status(201).json(dept);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedBy: req.user._id,
      updatedAt: new Date(),
    };
    
    const updated = await Department.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-createdBy -createdAt +updatedBy +updatedAt');
    
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: "Department deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
