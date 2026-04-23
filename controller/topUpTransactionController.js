const { Op } = require("sequelize");
const { sequelize } = require("../database/database");
const db = require("../database/database");

/*
=================================
Helper: Get Supplier Stock
=================================
*/
const getSupplierStock = async (business_owner_id, supplier_id, t = null) => {

  const totalBuy = await db.topUpTransaction.sum("topup_amount", {
    where: {
      business_owner_id,
      supplier_id,
      transaction_type: "purchase"
    },
    transaction: t
  });

  const totalSell = await db.topUpTransaction.sum("topup_amount", {
    where: {
      business_owner_id,
      supplier_id,
      transaction_type: "sale"
    },
    transaction: t
  });

  return (totalBuy || 0) - (totalSell || 0);
};

/*
=================================
Buy Topup From Supplier
=================================
*/
exports.buyTopupFromSupplier = async (req, res) => {

  const t = await sequelize.transaction();

  try {

    const business_owner_id = req.business_owner_id;

    const {
      supplier_id,
      base_amount,
      paid_amount = 0,
      reference_no,
      notes
    } = req.body;

    const supplier = await db.supplier.findOne({
      where: { id: supplier_id, business_owner_id }
    });

    if (!supplier) {
      await t.rollback();
      return res.status(404).json({ message: "Supplier not found" });
    }

    const bonus = supplier.bonus_percentage || 0;

    const topup_amount = base_amount + (base_amount * bonus / 100);

    const transaction = await db.topUpTransaction.create({

      business_owner_id,
      supplier_id,

      transaction_type: "purchase",

      base_amount,
      bonus_percentage: bonus,
      topup_amount,

      debit: paid_amount,
      credit: base_amount,

      reference_no,
      notes,
      transaction_date: new Date()

    }, { transaction: t });

    await t.commit();

    res.json({
      message: "Topup purchased successfully",
      transaction
    });

  } catch (error) {

    await t.rollback();
    res.status(500).json({ message: "Server error" });

  }

};


/*
=================================
Sell Topup To Reseller
=================================
*/
exports.sellTopupToReseller = async (req, res) => {

  const t = await sequelize.transaction();

  try {

    const business_owner_id = req.business_owner_id;

    const {
      reseller_id,
      supplier_id,
      base_amount,
      paid_amount = 0,
      reference_no,
      notes
    } = req.body;

    const reseller = await db.reseller.findOne({
      where: { id: reseller_id, business_owner_id }
    });

    if (!reseller) {
      await t.rollback();
      return res.status(404).json({ message: "Reseller not found" });
    }

    const stock = await getSupplierStock(
      business_owner_id,
      supplier_id,
      t
    );

    if (stock < base_amount) {

      await t.rollback();

      return res.status(400).json({
        message: "Supplier stock not enough"
      });

    }

    const bonus = reseller.bonus_percentage || 0;

    const topup_amount = base_amount + (base_amount * bonus / 100);

    const transaction = await db.topUpTransaction.create({

      business_owner_id,
      supplier_id,
      reseller_id,

      transaction_type: "sale",

      base_amount,
      bonus_percentage: bonus,
      topup_amount,

      debit: base_amount,
      credit: paid_amount,

      reference_no,
      notes,
      transaction_date: new Date()

    }, { transaction: t });

    await t.commit();

    res.json({
      message: "Topup sold successfully",
      transaction
    });

  } catch (error) {

    await t.rollback();
    res.status(500).json({ message: "Server error" });

  }

};


/*
=================================
Supplier Payment
=================================
*/
exports.supplierPayment = async (req, res) => {

  const t = await sequelize.transaction();

  try {

    const business_owner_id = req.business_owner_id;

    const {
      transaction_id,
      amount,
      reference_no,
      notes
    } = req.body;

    const purchase = await db.topUpTransaction.findOne({
      where:{
        id: transaction_id,
        business_owner_id,
        transaction_type: "purchase"
      }
    });

    if(!purchase){
      await t.rollback();
      return res.status(404).json({ message:"Purchase transaction not found" });
    }

    const totalPaid = parseFloat(purchase.debit || 0);
    const totalCost = parseFloat(purchase.credit || 0);

    const due = totalCost - totalPaid;

    if(due <= 0){
      await t.rollback();
      return res.status(400).json({ message:"No due remaining" });
    }

    if(amount > due){
      await t.rollback();
      return res.status(400).json({ message:"Payment exceeds due amount" });
    }

    const newPaid = totalPaid + parseFloat(amount);

    await purchase.update({
      debit: newPaid,
      reference_no,
      notes
    }, { transaction:t });

    await t.commit();

    res.json({
      message:"Supplier payment updated successfully",
      paid: newPaid,
      remaining_due: totalCost - newPaid
    });

  } catch(error){

    await t.rollback();
    res.status(500).json({ message:"Server error" });

  }

};


/*
=================================
Reseller Payment
=================================
*/
exports.resellerPayment = async (req, res) => {

  const t = await sequelize.transaction();

  try {

    const business_owner_id = req.business_owner_id;

    const {
      transaction_id,
      amount,
      reference_no,
      notes
    } = req.body;

    const sale = await db.topUpTransaction.findOne({
      where:{
        id: transaction_id,
        business_owner_id,
        transaction_type:"sale"
      }
    });

    if(!sale){
      await t.rollback();
      return res.status(404).json({ message:"Sale transaction not found" });
    }

    const received = parseFloat(sale.credit || 0);
    const totalSale = parseFloat(sale.debit || 0);

    const due = totalSale - received;

    if(due <= 0){
      await t.rollback();
      return res.status(400).json({ message:"No due remaining" });
    }

    if(amount > due){
      await t.rollback();
      return res.status(400).json({ message:"Payment exceeds due" });
    }

    const newReceived = received + parseFloat(amount);

    await sale.update({
      credit:newReceived,
      reference_no,
      notes
    }, { transaction:t });

    await t.commit();

    res.json({
      message:"Reseller payment updated successfully",
      received:newReceived,
      remaining_due: totalSale - newReceived
    });

  } catch(error){

    await t.rollback();
    res.status(500).json({ message:"Server error" });

  }

};


/*
=================================
Supplier Statistics
=================================
*/
exports.getSupplierStatistics = async (req, res) => {

  try {

    const business_owner_id = req.business_owner_id;

    const { supplier_id } = req.params;

    const totalPurchase = await db.topUpTransaction.sum("base_amount", {
      where: { business_owner_id, supplier_id, transaction_type: "purchase" }
    });

    const totalPaid = await db.topUpTransaction.sum("debit", {
      where: { business_owner_id, supplier_id }
    });

    const stock = await getSupplierStock(
      business_owner_id,
      supplier_id
    );

    res.json({

      total_purchase: totalPurchase || 0,
      total_paid: totalPaid || 0,
      total_due: (totalPurchase || 0) - (totalPaid || 0),
      current_stock: stock

    });

  } catch (error) {

    res.status(500).json({ message: "Server error" });

  }

};


/*
=================================
Reseller Statistics
=================================
*/
exports.getResellerStatistics = async (req, res) => {

  try {

    const business_owner_id = req.business_owner_id;

    const { reseller_id } = req.params;

    const totalSale = await db.topUpTransaction.sum("base_amount", {
      where: { business_owner_id, reseller_id, transaction_type: "sale" }
    });

    const totalPaid = await db.topUpTransaction.sum("credit", {
      where: { business_owner_id, reseller_id }
    });

    res.json({

      total_sale: totalSale || 0,
      total_paid: totalPaid || 0,
      total_due: (totalSale || 0) - (totalPaid || 0)

    });

  } catch (error) {

    res.status(500).json({ message: "Server error" });

  }

};


/*
=================================
Profit Statistics
=================================
*/


exports.getProfitStatistics = async (req, res) => {
  try {
    const business_owner_id = req.business_owner_id;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // start of today
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // start of next day

    // -----------------------------
    // Total Revenue (from Resellers)
    // -----------------------------
    const totalRevenue = await db.topUpTransaction.sum("credit", {
      where: {
        business_owner_id,
        transaction_type: { [Op.in]: ["sale", "reseller_payment"] }
      }
    });

    const todayRevenue = await db.topUpTransaction.sum("credit", {
      where: {
        business_owner_id,
        transaction_type: { [Op.in]: ["sale", "reseller_payment"] },
        transaction_date: { [Op.between]: [today, tomorrow] }
      }
    });

    // -----------------------------
    // Total Cost (to Suppliers)
    // -----------------------------
    const totalCost = await db.topUpTransaction.sum("debit", {
      where: {
        business_owner_id,
        transaction_type: { [Op.in]: ["purchase", "supplier_payment"] }
      }
    });

    const todayCost = await db.topUpTransaction.sum("debit", {
      where: {
        business_owner_id,
        transaction_type: { [Op.in]: ["purchase", "supplier_payment"] },
        transaction_date: { [Op.between]: [today, tomorrow] }
      }
    });

    // -----------------------------
    // Profit Calculation
    // -----------------------------
    const totalProfit = (totalRevenue || 0) - (totalCost || 0);
    const todayProfit = (todayRevenue || 0) - (todayCost || 0);

    // -----------------------------
    // Optional: Include Due Amounts
    // -----------------------------
    // Supplier due = total credit (purchase) - total debit (paid)
    const supplierDue = await db.topUpTransaction.sum("credit", {
      where: {
        business_owner_id,
        transaction_type: "purchase"
      }
    }) - await db.topUpTransaction.sum("debit", {
      where: {
        business_owner_id,
        transaction_type: "purchase"
      }
    });

    // Reseller due = total debit (sale) - total credit (received)
    const resellerDue = await db.topUpTransaction.sum("debit", {
      where: {
        business_owner_id,
        transaction_type: "sale"
      }
    }) - await db.topUpTransaction.sum("credit", {
      where: {
        business_owner_id,
        transaction_type: "sale"
      }
    });

    return res.json({
      total: {
        revenue: totalRevenue || 0,
        cost: totalCost || 0,
        profit: totalProfit,
        supplier_due: supplierDue || 0,
        reseller_due: resellerDue || 0
      },
      today: {
        revenue: todayRevenue || 0,
        cost: todayCost || 0,
        profit: todayProfit
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


/*
=================================
Get All Transactions
=================================
*/


exports.getAllTransactions = async (req, res) => {

  try {

    const business_owner_id = req.business_owner_id;

    let {
      page = 1,
      limit = 20,
      transaction_type,
      supplier_id,
      reseller_id,
      search,
      min_amount,
      max_amount,
      start_date,
      end_date
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;

    const whereCondition = {
      business_owner_id
    };

    // transaction type filter
    if (transaction_type) {

      const types = transaction_type.split(",").map(t => t.trim());

      whereCondition.transaction_type =
        types.length === 1 ? types[0] : { [Op.in]: types };

    }

    // supplier filter
    if (supplier_id) {
      whereCondition.supplier_id = supplier_id;
    }

    // reseller filter
    if (reseller_id) {
      whereCondition.reseller_id = reseller_id;
    }

    // amount filter
    if (min_amount || max_amount) {

      whereCondition.base_amount = {};

      if (min_amount)
        whereCondition.base_amount[Op.gte] = min_amount;

      if (max_amount)
        whereCondition.base_amount[Op.lte] = max_amount;

    }

    // date filter
    if (start_date || end_date) {

      whereCondition.transaction_date = {};

      if (start_date)
        whereCondition.transaction_date[Op.gte] = start_date;

      if (end_date)
        whereCondition.transaction_date[Op.lte] = end_date;

    }

    // search condition
    if (search) {

      whereCondition[Op.or] = [
        { reference_no: { [Op.like]: `%${search}%` } },
        { notes: { [Op.like]: `%${search}%` } }
        
      ];

    }

    const { count, rows } = await db.topUpTransaction.findAndCountAll({

      where: whereCondition,

      include: [

        {
          model: db.supplier,
          attributes: ["id", "name"]
        },

        {
          model: db.reseller,
          attributes: ["id", "name"]
        }

      ],

      order: [["transaction_date", "DESC"]],

      limit,
      offset

    });

    res.json({

      status: true,

      pagination: {
        total_records: count,
        current_page: page,
        per_page: limit,
        total_pages: Math.ceil(count / limit)
      },

      transactions: rows

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};


/*
=================================
Monthly Transactions
=================================
*/
exports.getMonthlyTransactions = async (req, res) => {

  try {

    const business_owner_id = req.business_owner_id;

    const { month, year } = req.query;

    const startDate = new Date(year, month - 1, 1);

    const endDate = new Date(year, month, 0);

    const transactions = await db.topUpTransaction.findAll({

      where: {

        business_owner_id,

        transaction_date: {
          [Op.between]: [startDate, endDate]
        }

      },

      order: [["transaction_date", "DESC"]]

    });

    res.json({ transactions });

  } catch (error) {

    res.status(500).json({ message: "Server error" });

  }

};


/*
=================================
Get Current Stock
=================================
*/
exports.getCurrentStock = async (req, res) => {

  try {

    const business_owner_id = req.business_owner_id;

    const { supplier_id } = req.query;

    const stock = await getSupplierStock(
      business_owner_id,
      supplier_id
    );

    res.json({ stock });

  } catch (error) {

    res.status(500).json({ message: "Server error" });

  }

};