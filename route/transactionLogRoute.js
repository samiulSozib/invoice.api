const express = require("express");
const router = express.Router();
const { getTransactionLogs, getDashboardStats } = require("../controller/invoiceTransactionLogController");
const authenticateToken = require("../middleware/authMiddleware");

// GET /transaction-logs?invoice_id=24&client_id=21
router.get('/statistics',authenticateToken,getDashboardStats)
router.get("/", authenticateToken, getTransactionLogs);


module.exports = router;