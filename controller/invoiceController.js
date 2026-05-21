const { Op } = require("sequelize");
const db = require("../database/database");
const { sequelize } = require('../database/database')


// GET Invoice List
exports.getInvoiceList = async (req, res) => {
  try {
    const business_owner_id = req.business_owner_id;

    let {
      page = 1,
      item_per_page = 20,
      status,
      client_id,
      shop_id,
      from_date,
      to_date,
      search,
      search_by = "all"
    } = req.query;

    page = parseInt(page);
    item_per_page = parseInt(item_per_page);

    const offset = (page - 1) * item_per_page;
    const limit = item_per_page;

    const whereClause = {};

    if (business_owner_id) {
      whereClause.business_owner_id = business_owner_id;
    }

    // const whereClause = { business_owner_id };

    // -------------------------
    // Filters
    // -------------------------

    if (status) whereClause.status = status;
    if (client_id) whereClause.client_id = client_id;
    if (shop_id) whereClause.shop_id = shop_id;

    // Date Filter (createdAt)
    if (from_date && to_date) {
      whereClause.createdAt = {
        [Op.between]: [new Date(from_date), new Date(to_date)],
      };
    } else if (from_date) {
      whereClause.createdAt = { [Op.gte]: new Date(from_date) };
    } else if (to_date) {
      whereClause.createdAt = { [Op.lte]: new Date(to_date) };
    }

    // -------------------------
    // Search (MySQL compatible)
    // -------------------------

    if (search) {
      const searchCondition = {
        [Op.like]: `%${search}%`
      };

      if (search_by !== "all") {
        // Search specific column
        whereClause[search_by] = searchCondition;
      } else {
        // Global Search
        whereClause[Op.or] = [
          { status: searchCondition },

          // Search numeric fields safely (cast to CHAR)
          db.sequelize.where(
            db.sequelize.cast(db.sequelize.col("invoice.id"), "CHAR"),
            searchCondition
          ),
          db.sequelize.where(
            db.sequelize.cast(db.sequelize.col("invoice.total"), "CHAR"),
            searchCondition
          ),
          db.sequelize.where(
            db.sequelize.cast(db.sequelize.col("invoice.sub_total"), "CHAR"),
            searchCondition
          ),


        ];
      }
    }

    // -------------------------
    // Query Execution
    // -------------------------


    // const invoices= await db.invoice.findAll()
    // return res.json(invoices)

    const { count, rows } = await db.invoice.findAndCountAll({
      where: whereClause,
      offset,
      limit,
      distinct: true,   // important when using include
      col: "id",
      include: [
        {
          model: db.invoiceItem,
        },
        {
          model: db.client,
        },
        {
          model: db.shop,
        },
      ],
      order: [["createdAt", "DESC"]],
    });



    return res.status(200).json({
      status: true,
      message: "Invoice list fetched successfully",
      invoice_list: rows,
      pagination: {
        total_items: count,
        total_pages: Math.ceil(count / item_per_page),
        current_page: page,
        item_per_page,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
      invoice_list: [],
    });
  }
};


// get invoice by id
exports.getInvoiceById = async (req, res, next) => {
  const transactionScope = await sequelize.transaction();
  const business_owner_id = req.business_owner_id;
  const { invoice_id } = req.params;

  try {
    const invoice = await db.invoice.findOne({
      where: {
        id: invoice_id,
        business_owner_id
      },
      include: [
        {
          model: db.invoiceItem,
        },
        {
          model: db.client
        },
        {
          model: db.shop
        }
      ],
      transaction: transactionScope,
    });

    if (!invoice) {
      await transactionScope.rollback();
      return res.status(404).json({
        status: false,
        message: "Invoice not found",
        invoice: null
      });
    }

    await transactionScope.commit();

    return res.status(200).json({
      status: true,
      message: "",
      invoice,
    });
  } catch (error) {
    if (transactionScope) await transactionScope.rollback();
    console.error(error);
    return res.status(503).json({
      status: false,
      message: "Internal Server Error",
      invoice: null
    });
  }
};


// create invoice
exports.createInvoice = async (req, res, next) => {
  const transactionScope = await sequelize.transaction();
  const business_owner_id = req.business_owner_id;
  const business_owner = req.business_owner;



  try {
    const {
      client_id,
      shop_id,
      tax,
      discount,
      sub_total,
      due,
      total,
      status,
      date,
      shipping_cost,
    
      payable_date,
      items, // This should be an array of invoice items
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({
          status: false,
          message: "Invoice must have at least one item.",
        });
    }

    const invoiceCount = await db.invoice.count({ where: { business_owner_id: business_owner_id } });
    if (!business_owner.is_premium) {
      

      if (invoiceCount >= 10) {
        await transactionScope.rollback();
        return res.status(400).json({ status: false, message: 'account limit reached' });
      }
    }

    // Next invoice serial number
    const nextInvoiceNumber = String(invoiceCount + 1).padStart(8, '0');


    

    // Final invoice number
    const invoice_number = `INV-${business_owner_id}-${nextInvoiceNumber}`;

    // Create invoice
    const invoice = await db.invoice.create(
      {
        invoice_number,
        business_owner_id,
        client_id,
        shop_id,
        tax,
        discount,
        sub_total,
        due,
        total,
        status,
        date,
        shipping_cost,
        payable_date,
      },
      { transaction: transactionScope }
    );

    // Create invoice items
    const invoiceItems = items.map((item) => ({
      invoice_id: invoice.id,
      product_name: item.product_name,
      product_price: item.product_price,
      quantity: item.quantity,
      unit_of_measure: item.unit_of_measure,
      discount: item.discount,
      discount_type: item.discount_type,
      vat: item.vat,
      total: item.total,
    }));

    await db.invoiceItem.bulkCreate(invoiceItems, {
      transaction: transactionScope,
    });
 // 4️⃣ Update Client total_due
    await db.client.increment(
      { total_due: due|| 0 },
      {
        where: { id: invoice.client_id },
        transaction: transactionScope,
      }
    );


    // 3️⃣ Update Business Owner Totals
    await db.businessOwner.increment(
      {
        total_sales_amount: total || 0,
        total_unpaid_amount: due || 0,
      },
      {
        where: { id: business_owner_id },
        transaction: transactionScope,
      }
    );

    // 4️⃣ Create Transaction Log for Invoice Creation
    await db.transactionLog.create({
      business_owner_id,
      client_id,
      invoice_id: invoice.id,
      type: 'invoice_created',
      total: total || 0,
      sub_total: sub_total || 0,
      due_before: 0,           // invoice just created
      payment_amount: 0,       // no payment yet
      due_after: due || 0,
      status,
      note: `Invoice #${invoice.id} created with total ${total}, due ${due}.`,
    }, { transaction: transactionScope });

    const new_invoice = await db.invoice.findOne({
      where: {
        id: invoice.id,
      },
      include: [
        {
          model: db.invoiceItem,
        },
        {
          model: db.client
        },
        {
          model: db.shop
        }
      ],
      transaction: transactionScope,
    });


    await transactionScope.commit();

    return res.status(201).json({
      status: true,
      message: "Invoice created successfully",
      invoice: new_invoice,
    });
  } catch (error) {
    if (transactionScope) await transactionScope.rollback();
    console.error(error);
    return res.status(503).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};


exports.payDue = async (req, res) => {
  const transactionScope = await sequelize.transaction();
  const business_owner_id = req.business_owner_id;

  try {
    const { invoice_id } = req.params;
    const { payment_amount } = req.body;

    if (!payment_amount || payment_amount <= 0) {
      return res.status(400).json({
        status: false,
        message: "Valid payment amount is required",
      });
    }

    // 1️⃣ Find Invoice
    const invoice = await db.invoice.findOne({
      where: { id: invoice_id, business_owner_id },
      transaction: transactionScope,
    });

    if (!invoice) {
      await transactionScope.rollback();
      return res.status(404).json({
        status: false,
        message: "Invoice not found",
      });
    }

    if (invoice.due <= 0) {
      await transactionScope.rollback();
      return res.status(400).json({
        status: false,
        message: "Invoice already fully paid",
      });
    }

    if (payment_amount > invoice.due) {
      await transactionScope.rollback();
      return res.status(400).json({
        status: false,
        message: "Payment exceeds due amount",
      });
    }

    // 2️⃣ Calculate new due
    const newDue = invoice.due - payment_amount;

    let newStatus = "partial";
    if (newDue === 0) {
      newStatus = "paid";
    }

    // 3️⃣ Update Invoice
    await invoice.update(
      {
        due: newDue,
        status: newStatus,
      },
      { transaction: transactionScope }
    );

    // 4️⃣ Update Client total_due
    await db.client.decrement(
      { total_due: payment_amount },
      {
        where: { id: invoice.client_id },
        transaction: transactionScope,
      }
    );

    // 5️⃣ Update Business Owner total_unpaid_amount
    await db.businessOwner.decrement(
      { total_unpaid_amount: payment_amount },
      {
        where: { id: business_owner_id },
        transaction: transactionScope,
      }
    );




    // 6️⃣ Create Transaction Log for Payment
    await db.transactionLog.create({
      business_owner_id,
      client_id: invoice.client_id,
      invoice_id: invoice.id,
      type: 'payment',
      total: invoice.total,
      sub_total: invoice.sub_total,
      due_before: invoice.due,      // before payment
      payment_amount,
      due_after: newDue,
      status: newStatus,
      note: `Payment of ${payment_amount} received for Invoice #${invoice.id}.`,
    }, { transaction: transactionScope });

    await transactionScope.commit();

    return res.status(201).json({
      status: true,
      message: newStatus === "paid"
        ? "Invoice fully paid"
        : "Partial payment successful",
      remaining_due: newDue,
    });

  } catch (error) {
    if (transactionScope) await transactionScope.rollback();
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};


// DELETE single invoice
// DELETE single invoice
exports.deleteInvoice = async (req, res) => {
  const transactionScope = await sequelize.transaction();
  const business_owner_id = req.business_owner_id;

  try {
    const { invoice_id } = req.params;

    const invoice = await db.invoice.findOne({
      where: { id: invoice_id, business_owner_id },
      transaction: transactionScope,
    });

    if (!invoice) {
      await transactionScope.rollback();
      return res.status(404).json({
        status: false,
        message: "Invoice not found",
      });
    }

    // 1️⃣ Create Transaction Log FIRST
    await db.transactionLog.create({
      business_owner_id,
      client_id: invoice.client_id,
      invoice_id: invoice.id,
      type: "invoice_deleted",
      total: invoice.total,
      sub_total: invoice.sub_total,
      due_before: invoice.due,
      payment_amount: 0,
      due_after: 0,
      status: "deleted",
      note: `Invoice #${invoice.id} deleted.`,
    }, { transaction: transactionScope });

    // 2️⃣ Update Business Owner totals
    await db.businessOwner.decrement(
      {
        total_sales_amount: invoice.total || 0,
        total_unpaid_amount: invoice.due || 0,
      },
      {
        where: { id: business_owner_id },
        transaction: transactionScope,
      }
    );

    // 3️⃣ Update Client total_due
    await db.client.decrement(
      { total_due: invoice.due || 0 },
      {
        where: { id: invoice.client_id },
        transaction: transactionScope,
      }
    );

    // 4️⃣ Delete invoice items
    await db.invoiceItem.destroy({
      where: { invoice_id: invoice.id },
      transaction: transactionScope,
    });

    // 5️⃣ Delete invoice
    await invoice.destroy({ transaction: transactionScope });

    await transactionScope.commit();

    return res.status(200).json({
      status: true,
      message: "Invoice deleted successfully",
    });

  } catch (error) {
    await transactionScope.rollback();
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};


// DELETE multiple invoices
// exports.deleteMultipleInvoices = async (req, res) => {
//   const transactionScope = await sequelize.transaction();
//   const business_owner_id = req.business_owner_id;

//   try {
//     const { invoice_ids } = req.body;

//     if (!invoice_ids || !Array.isArray(invoice_ids) || invoice_ids.length === 0) {
//       return res.status(400).json({
//         status: false,
//         message: "invoice_ids array is required",
//       });
//     }

//     const invoices = await db.invoice.findAll({
//       where: {
//         id: { [Op.in]: invoice_ids },
//         business_owner_id,
//       },
//       transaction: transactionScope,
//     });

//     if (invoices.length === 0) {
//       await transactionScope.rollback();
//       return res.status(404).json({
//         status: false,
//         message: "No invoices found",
//       });
//     }

//     let totalSalesToDeduct = 0;
//     let totalUnpaidToDeduct = 0;

//     for (const invoice of invoices) {
//       totalSalesToDeduct += invoice.total || 0;
//       totalUnpaidToDeduct += invoice.due || 0;

//       // Delete invoice items
//       await db.invoiceItem.destroy({
//         where: { invoice_id: invoice.id },
//         transaction: transactionScope,
//       });

//       // Create log
//       await db.transactionLog.create({
//         business_owner_id,
//         client_id: invoice.client_id,
//         invoice_id: invoice.id,
//         type: "invoice_deleted",
//         total: invoice.total,
//         sub_total: invoice.sub_total,
//         due_before: invoice.due,
//         payment_amount: 0,
//         due_after: 0,
//         status: "deleted",
//         note: `Invoice #${invoice.id} deleted.`,
//       }, { transaction: transactionScope });
//     }

//     // Update Business Owner totals once
//     await db.businessOwner.decrement(
//       {
//         total_sales_amount: totalSalesToDeduct,
//         total_unpaid_amount: totalUnpaidToDeduct,
//       },
//       {
//         where: { id: business_owner_id },
//         transaction: transactionScope,
//       }
//     );

//     // Delete invoices
//     await db.invoice.destroy({
//       where: {
//         id: { [Op.in]: invoice_ids },
//         business_owner_id,
//       },
//       transaction: transactionScope,
//     });

//     await transactionScope.commit();

//     return res.status(200).json({
//       status: true,
//       message: "Invoices deleted successfully",
//     });

//   } catch (error) {
//     await transactionScope.rollback();
//     console.error(error);
//     return res.status(500).json({
//       status: false,
//       message: "Internal Server Error",
//     });
//   }
// };
