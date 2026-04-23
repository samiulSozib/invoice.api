const express = require("express");
const router = express.Router();

const resellerController = require("../controller/resellerController");
const authenticateToken = require("../middleware/authMiddleware");


// Get All Resellers
router.get("/",authenticateToken, resellerController.getResellers);


// Create Reseller
router.post("/",authenticateToken, resellerController.createReseller);


// Update Reseller
router.put("/:reseller_id",authenticateToken, resellerController.updateReseller);


// Update Reseller Percentage
router.patch("/percentage/:reseller_id",authenticateToken, resellerController.updateResellerPercentage);


// Change Reseller Status
router.patch("/status/:reseller_id",authenticateToken, resellerController.changeResellerStatus);


// Delete Reseller
router.delete("/:reseller_id",authenticateToken, resellerController.deleteReseller);


module.exports = router;