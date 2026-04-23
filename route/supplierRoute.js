const express = require("express");
const router = express.Router();

const supplierController = require("../controller/supplierController");
const authenticateToken = require("../middleware/authMiddleware");


// Get All Suppliers
router.get("/",authenticateToken, supplierController.getSuppliers);


// Create Supplier
router.post("/",authenticateToken, supplierController.createSupplier);


// Update Supplier
router.put("/:supplier_id",authenticateToken, supplierController.updateSupplier);


// Update Supplier Percentage
router.patch("/percentage/:supplier_id",authenticateToken, supplierController.updateSupplierPercentage);


// Change Supplier Status
router.patch("/status/:supplier_id",authenticateToken, supplierController.changeSupplierStatus);


// Delete Supplier
router.delete("/:supplier_id",authenticateToken, supplierController.deleteSupplier);


module.exports = router;