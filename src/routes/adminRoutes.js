const express = require("express");
const router = express.Router();
const {
  createStaff,
  updateStaff,
  deleteStaff,
  getAllStaff,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getAllDoctors,
  assignDoctorsToDepartment,
  getHospitalStatistics,
} = require("../controllers/adminController");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");


router.post("/staff", authenticate, authorizeRoles("admin"), createStaff);
router.put("/staff/:id", authenticate, authorizeRoles("admin"), updateStaff);
router.delete("/staff/:id", authenticate, authorizeRoles("admin"), deleteStaff);
router.get(
  "/staff",
  authenticate,
  authorizeRoles("admin", "subadmin"),
  getAllStaff
);


router.post("/doctors", authenticate, authorizeRoles("admin"), createDoctor);
router.put("/doctors/:id", authenticate, authorizeRoles("admin"), updateDoctor);
router.delete(
  "/doctors/:id",
  authenticate,
  authorizeRoles("admin"),
  deleteDoctor
);
router.get(
  "/doctors",
  authenticate,
  authorizeRoles("admin", "subadmin"),
  getAllDoctors
);


router.post(
  "/assign-doctors",
  authenticate,
  authorizeRoles("admin"),
  assignDoctorsToDepartment
);


router.get(
  "/hospital-statistics",
  authenticate,
  authorizeRoles("admin", "subadmin"),
  getHospitalStatistics
);

module.exports = router;
