const express = require("express");
const router = express.Router();
const {
  getHealthStatus,
  getStatus,
  getSystemInfo,
} = require("../controllers/healthController");

/**
 * @route   GET /health
 * @desc    Comprehensive health check with database, cron jobs, and system info
 * @access  Public
 */
router.get("/health", getHealthStatus);

/**
 * @route   GET /status
 * @desc    Simple status check
 * @access  Public
 */
router.get("/status", getStatus);

/**
 * @route   GET /api/system/info
 * @desc    Detailed system information and database statistics
 * @access  Public
 */
router.get("/api/system/info", getSystemInfo);

module.exports = router;
