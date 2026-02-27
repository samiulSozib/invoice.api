const express = require("express");
const router = express.Router();
const {getTransactionLogs} = require("../controller/invoiceTransactionLogController");
const authenticateToken = require("../middleware/authMiddleware");

// GET /transaction-logs?invoice_id=24&client_id=21
router.get("/", authenticateToken,getTransactionLogs);

module.exports = router;