const express = require("express");
const router = express.Router();

const topupController = require("../controller/topUpTransactionController");
const authenticateToken = require("../middleware/authMiddleware");


// =============================
// Buy Topup From Supplier
// =============================
router.post(
  "/supplier/buy",
  authenticateToken,
  topupController.buyTopupFromSupplier
);


// =============================
// Sell Topup To Reseller
// =============================
router.post(
  "/reseller/sell",
  authenticateToken,
  topupController.sellTopupToReseller
);


// =============================
// Supplier Payment
// =============================
router.post(
  "/supplier/payment",
  authenticateToken,
  topupController.supplierPayment
);


// =============================
// Reseller Payment
// =============================
router.post(
  "/reseller/collection",
  authenticateToken,
  topupController.resellerPayment
);


// =============================
// All Transactions
// =============================
router.get(
  "/transactions",
  authenticateToken,
  topupController.getAllTransactions
);


// =============================
// Supplier Statistics
// =============================
router.get(
  "/supplier/statistics/:supplier_id",
  authenticateToken,
  topupController.getSupplierStatistics
);


// =============================
// Reseller Statistics
// =============================
router.get(
  "/reseller/statistics/:reseller_id",
  authenticateToken,
  topupController.getResellerStatistics
);


// =============================
// Profit Statistics
// =============================
router.get(
  "/statistics/profit",
  authenticateToken,
  topupController.getProfitStatistics
);


// =============================
// Monthly Transactions
// =============================
router.get(
  "/transactions/monthly",
  authenticateToken,
  topupController.getMonthlyTransactions
);


// =============================
// Current Supplier Stock
// =============================
router.get(
  "/stock",
  authenticateToken,
  topupController.getCurrentStock
);


module.exports = router;