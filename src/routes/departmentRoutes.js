const express = require("express");
const router = express.Router();
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");


router.get("/", getDepartments);
router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "subadmin"),
  createDepartment
);
router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin", "subadmin"),
  updateDepartment
);
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin", "subadmin"),
  deleteDepartment
);

module.exports = router;
