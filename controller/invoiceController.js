const { Op, where } = require("sequelize");
const { sequelize } = require("../database/database");
const db = require("../database/database");


// get invoice list
exports.getInvoiceList = async (req, res, next) => {
  const transactionScope = await sequelize.transaction();
  const business_owner_id = req.business_owner_id;

  const {
    page = 1,
    item_per_page = 20,
    status,
    client_id,
    shop_id,
    from_date,
    to_date,
    search
  } = req.query;

  const offset = (page - 1) * item_per_page;
  const limit = parseInt(item_per_page);

  const whereClause = { business_owner_id };

  if (status) whereClause.status = status;
  if (client_id) whereClause.client_id = client_id;
  if (shop_id) whereClause.shop_id = shop_id;

  if (from_date && to_date) {
    whereClause.date = {
      [Op.between]: [new Date(from_date), new Date(to_date)],
    };
  } else if (from_date) {
    whereClause.date = { [Op.gte]: new Date(from_date) };
  } else if (to_date) {
    whereClause.date = { [Op.lte]: new Date(to_date) };
  }

  if (search) {
    whereClause[Op.or] = [
      { status: { [Op.iLike]: `%${search}%` } },
      sequelize.where(sequelize.cast(sequelize.col("invoice.id"), 'TEXT'), {
        [Op.iLike]: `%${search}%`
      }),
    ];
  }

  try {
    const { count, rows: invoice_list } = await db.invoice.findAndCountAll({
      where: whereClause,
      offset,
      limit,
      include:[
        {
          model:db.invoiceItem
        },
        {
          model:db.client
        },
        {
          model:db.shop
        }
      ],
      transaction: transactionScope,
      order: [['createdAt', 'DESC']]
    });

    await transactionScope.commit();

    return res.status(200).json({
      status: true,
      message: "",
      invoice_list,
      pagination: {
        total_items: count,
        total_pages: Math.ceil(count / item_per_page),
        current_page: parseInt(page),
        item_per_page: parseInt(item_per_page),
      },
    });
  } catch (error) {
    if (transactionScope) await transactionScope.rollback();
    console.log(error);
    return res.status(503).json({
      status: false,
      message: "Internal Server Error",
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
          model:db.client
        },
        {
          model:db.shop
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
      over_due,
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

    // Create invoice
    const invoice = await db.invoice.create(
      {
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
        over_due,
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

    await transactionScope.commit();

    return res.status(201).json({
      status: true,
      message: "Invoice created successfully",
      invoice_id: invoice.id,
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


