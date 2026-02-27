const { Op } = require("sequelize");
const db = require("../database/database");

// GET Transaction Logs
exports.getTransactionLogs = async (req, res) => {
  try {
    const business_owner_id = req.business_owner_id;

    const {
      invoice_id,
      client_id,
      page = 1,
      item_per_page = 20,
    } = req.query;

    // Pagination
    const limit = parseInt(item_per_page);
    const offset = (parseInt(page) - 1) * limit;

    // Build where clause
    const whereClause = { business_owner_id };

    if (invoice_id) whereClause.invoice_id = invoice_id;
    if (client_id) whereClause.client_id = client_id;

    // Fetch logs
    const { count, rows } = await db.transactionLog.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      status: true,
      message: "Transaction logs fetched successfully",
      transaction_logs: rows,
      pagination: {
        total_items: count,
        total_pages: Math.ceil(count / limit),
        current_page: parseInt(page),
        item_per_page: limit,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
      transaction_logs: [],
    });
  }
};