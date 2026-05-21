const { Op, where } = require('sequelize');
const { sequelize } = require('../database/database')
const db = require('../database/database')


// get products

exports.getProducts = async (req, res) => {
  try {
    const business_owner_id = req.business_owner_id;

    let {
      page = 1,
      item_per_page = 20,
      product_category_id,
      min_price,
      max_price,
      search,
      sort_by = "createdAt",
      order = "DESC"
    } = req.query;

    page = parseInt(page);
    item_per_page = parseInt(item_per_page);

    const offset = (page - 1) * item_per_page;
    const limit = item_per_page;

    const whereClause = { business_owner_id };

    // ---------------- Category Filter ----------------
    if (product_category_id) {
      whereClause.product_category_id = product_category_id;
    }

    // ---------------- Price Range Filter ----------------
    if (min_price && max_price) {
      whereClause.unit_price = {
        [Op.between]: [parseFloat(min_price), parseFloat(max_price)],
      };
    } else if (min_price) {
      whereClause.unit_price = { [Op.gte]: parseFloat(min_price) };
    } else if (max_price) {
      whereClause.unit_price = { [Op.lte]: parseFloat(max_price) };
    }

    // ---------------- Search by Name ----------------
    if (search) {
      whereClause.name = {
        [Op.like]: `%${search}%`
      };
    }

    // ---------------- Allowed Sorting Columns ----------------
    const allowedSortFields = [
      "name",
      "unit_price",
      "createdAt",
      "updatedAt"
    ];

    if (!allowedSortFields.includes(sort_by)) {
      sort_by = "createdAt";
    }

    order = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // ---------------- Query ----------------
    const { count, rows: products } = await db.product.findAndCountAll({
      where: whereClause,
      include: [{ model: db.productCategory }],
      offset,
      limit,
      order: [[sort_by, order]],
    });

    return res.status(200).json({
      status: true,
      message: "Products fetched successfully",
      products,
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
      products: [],
    });
  }
};


// get products by category id

exports.getProductsByCategoryId = async (req, res) => {
  try {
    const product_category_id = parseInt(req.params.category_id);
    const business_owner_id = req.business_owner_id;

    let {
      page = 1,
      item_per_page = 20,
      min_price,
      max_price,
      search,
      sort_by = "createdAt",
      order = "DESC"
    } = req.query;

    page = parseInt(page);
    item_per_page = parseInt(item_per_page);

    const offset = (page - 1) * item_per_page;
    const limit = item_per_page;

    // ---------------- Base Where Clause ----------------
    const whereClause = {
      business_owner_id,
      product_category_id
    };

    // ---------------- Price Filter ----------------
    if (min_price && max_price) {
      whereClause.unit_price = {
        [Op.between]: [parseFloat(min_price), parseFloat(max_price)],
      };
    } else if (min_price) {
      whereClause.unit_price = { [Op.gte]: parseFloat(min_price) };
    } else if (max_price) {
      whereClause.unit_price = { [Op.lte]: parseFloat(max_price) };
    }

    // ---------------- Search ----------------
    if (search) {
      whereClause.name = {
        [Op.like]: `%${search}%`
      };
    }

    // ---------------- Safe Sorting ----------------
    const allowedSortFields = [
      "name",
      "unit_price",
      "createdAt",
      "updatedAt"
    ];

    if (!allowedSortFields.includes(sort_by)) {
      sort_by = "createdAt";
    }

    order = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // ---------------- Query ----------------
    const { count, rows: products } = await db.product.findAndCountAll({
      where: whereClause,
      include: [{ model: db.productCategory }],
      offset,
      limit,
      order: [[sort_by, order]],
    });

    return res.status(200).json({
      status: true,
      message: "Products fetched successfully",
      products,
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
      products: [],
    });
  }
};

// Create Product
exports.createProduct = async (req, res, next) => {
  const transactionScope = await sequelize.transaction();
  const business_owner_id = req.business_owner_id

  const { product_category_id, name, unit_price, unit_of_measure } = req.body;

  try {
    const product = await db.product.create(
      { business_owner_id, product_category_id, name, unit_price, unit_of_measure },
      { transaction: transactionScope }
    );

    await transactionScope.commit();

    return res.status(201).json({ status: true, message: 'Product created successfully', product });
  } catch (error) {
    if (transactionScope) await transactionScope.rollback();
    console.error(error);
    return res.status(503).json({ status: false, message: 'Internal Server Error', product: null });
  }
};


// Edit Product
exports.editProduct = async (req, res, next) => {
  const transactionScope = await sequelize.transaction();
  const { product_id } = req.params; // Assuming the product ID is passed as a parameter
  const { product_category_id, name, unit_price, unit_of_measure } = req.body;

  try {
    const product = await db.product.findByPk(product_id, { transaction: transactionScope });

    if (!product) {
      return res.status(404).json({ status: false, message: 'Product not found' });
    }

    await product.update(
      { product_category_id, name, unit_price, unit_of_measure },
      { transaction: transactionScope }
    );

    const new_product = await db.product.findByPk(product_id)

    await transactionScope.commit();

    return res.status(201).json({ status: true, message: 'Product updated successfully', product: new_product });
  } catch (error) {
    if (transactionScope) await transactionScope.rollback();
    console.error(error);
    return res.status(503).json({ status: false, message: 'Internal Server Error', product: null });
  }
};


// Delete Product
exports.deleteProduct = async (req, res, next) => {
  const transactionScope = await sequelize.transaction();
  const { product_id } = req.params;


  try {
    const product = await db.product.findByPk(product_id, { transaction: transactionScope });

    if (!product) {
      return res.status(404).json({ status: false, message: 'Product not found' });
    }

    await product.destroy({ transaction: transactionScope });

    await transactionScope.commit();

    return res.status(200).json({ status: true, message: 'Product deleted successfully' });
  } catch (error) {
    if (transactionScope) await transactionScope.rollback();
    console.error(error);
    return res.status(503).json({ status: false, message: 'Internal Server Error' });
  }
};


// Get Product by ID
exports.getProductById = async (req, res, next) => {
  const transactionScope = await sequelize.transaction();
  const { product_id } = req.params; // Assuming the product ID is passed as a parameter

  try {
    const product = await db.product.findByPk(
      product_id,
      { transaction: transactionScope }
    );
    console.log(product)

    if (!product) {
      return res.status(404).json({ status: false, message: 'Product not found', product: null });
    }

    await transactionScope.commit();

    return res.status(200).json({ status: true, message: 'Product fetched successfully', product });
  } catch (error) {
    if (transactionScope) await transactionScope.rollback();
    console.error(error);
    return res.status(503).json({ status: false, message: 'Internal Server Error', product: null });
  }
};


// GET /best-selling-products - Best Selling Products by Quantity
exports.getBestSellingProducts = async (req, res) => {
  try {
    const business_owner_id = req.business_owner_id;

    const bestSellingProducts = await db.invoiceItem.findAll({
      attributes: [
        'product_name',
        'unit_of_measure',
        [
          sequelize.literal('SUM(quantity)'),
          'total_quantity_sold'
        ],
        [
          sequelize.literal('SUM(invoice_item.total)'),  // Fixed: specify table
          'total_revenue'
        ],
        [
          sequelize.literal('AVG(product_price)'),
          'average_price'
        ],
        [
          sequelize.literal('COUNT(DISTINCT invoice_id)'),
          'invoice_count'
        ]
      ],
      include: [
        {
          model: db.invoice,
          where: {
            business_owner_id: business_owner_id
          },
          attributes: [],
          required: true
        }
      ],
      group: ['product_name', 'unit_of_measure'],
      order: [
        [sequelize.literal('total_quantity_sold'), 'DESC']
      ],
      limit: 10,
      subQuery: false
    });

    return res.status(200).json({
      status: true,
      message: "Best selling products fetched successfully",
      products: bestSellingProducts
    });

  } catch (error) {
    console.error(error + "ffd");
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      products: []
    });
  }
};