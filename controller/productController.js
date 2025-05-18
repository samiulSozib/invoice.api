const { Op, where } = require('sequelize');
const {sequelize}=require('../database/database')
const db=require('../database/database')


// get products 
exports.getProducts = async (req, res, next) => {
  const transactionScope = await sequelize.transaction();
  const business_owner_id = req.business_owner_id;

  // pagination
  const page = parseInt(req.query.page) || 1;
  const item_per_page = parseInt(req.query.item_per_page) || 20;
  const offset = (page - 1) * item_per_page;
  const limit = item_per_page;

  try {
    const { count, rows: products } = await db.product.findAndCountAll({
      where: { business_owner_id },
      offset,
      limit,
      transaction: transactionScope,
    });

    await transactionScope.commit();

    return res.status(200).json({
      status: true,
      message: '',
      products,
      pagination: {
        total_items: count,
        total_pages: Math.ceil(count / item_per_page),
        current_page: page,
        item_per_page,
      },
    });

  } catch (error) {
    if (transactionScope) await transactionScope.rollback();
    console.log(error);
    return res.status(503).json({ status: false, message: 'Internal Server Error', products: [] });
  }
};


// get products by category id
exports.getProductsByCategoryId = async (req, res, next) => {
  const transactionScope = await sequelize.transaction();
  const product_category_id = req.params.category_id;
  const business_owner_id = req.business_owner_id;

  // pagination
  const page = parseInt(req.query.page) || 1;
  const item_per_page = parseInt(req.query.item_per_page) || 20;
  const offset = (page - 1) * item_per_page;
  const limit = item_per_page;

  try {
    const { count, rows: products } = await db.product.findAndCountAll({
      where: {
        [Op.and]: [
          { product_category_id },
          { business_owner_id },
        ]
      },
      offset,
      limit,
      transaction: transactionScope,
    });

    await transactionScope.commit();

    return res.status(200).json({
      status: true,
      message: '',
      products,
      pagination: {
        total_items: count,
        total_pages: Math.ceil(count / item_per_page),
        current_page: page,
        item_per_page,
      },
    });

  } catch (error) {
    if (transactionScope) await transactionScope.rollback();
    console.log(error);
    return res.status(503).json({ status: false, message: 'Internal Server Error', products: [] });
  }
};

// Create Product
exports.createProduct = async (req, res, next) => {
    const transactionScope = await sequelize.transaction();
    const business_owner_id=req.business_owner_id
 
    const { product_category_id, name, unit_price,unit_of_measure } = req.body;

    try {
        const product = await db.product.create(
            { business_owner_id, product_category_id,name,unit_price,unit_of_measure },
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
    const {product_category_id, name,unit_price, unit_of_measure } = req.body;

    try {
        const product = await db.product.findByPk(product_id, { transaction: transactionScope });

        if (!product) {
            return res.status(404).json({ status: false, message: 'Product not found' });
        }

        await product.update(
            { product_category_id,name, unit_price,unit_of_measure },
            { transaction: transactionScope }
        );

        const new_product=await db.product.findByPk(product_id)

        await transactionScope.commit();

        return res.status(200).json({ status: true, message: 'Product updated successfully', product:new_product });
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
