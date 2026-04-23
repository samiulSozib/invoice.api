const { Op } = require("sequelize");
const { sequelize } = require("../database/database");
const db = require("../database/database");



/*
================================
Get Suppliers
================================
*/

exports.getSuppliers = async (req, res) => {
  try {
    const business_owner_id = req.business_owner_id;

    let { page = 1, item_per_page = 20, search } = req.query;

    page = parseInt(page);
    item_per_page = parseInt(item_per_page);

    const offset = (page - 1) * item_per_page;

    const whereClause = { business_owner_id };

    if (search) {
      whereClause.name = {
        [Op.like]: `%${search}%`,
      };
    }

    const { count, rows: suppliers } = await db.supplier.findAndCountAll({
      where: whereClause,
      offset,
      limit: item_per_page,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      status: true,
      message: "Suppliers fetched successfully",
      suppliers,
      pagination: {
        total_items: count,
        total_pages: Math.ceil(count / item_per_page),
        current_page: page,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      suppliers: [],
    });
  }
};



/*
================================
Add Supplier
================================
*/

exports.createSupplier = async (req, res) => {
  const transactionScope = await sequelize.transaction();

  try {
    const business_owner_id = req.business_owner_id;

    const { name, phone, company, bonus_percentage } = req.body;

    const supplier = await db.supplier.create(
      {
        business_owner_id,
        name,
        phone,
        company,
        bonus_percentage,
      },
      { transaction: transactionScope }
    );

    await transactionScope.commit();

    return res.status(201).json({
      status: true,
      message: "Supplier created successfully",
      supplier,
    });
  } catch (error) {
    await transactionScope.rollback();
    console.error(error);

    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      supplier: null,
    });
  }
};



/*
================================
Update Supplier
================================
*/

exports.updateSupplier = async (req, res) => {
  const transactionScope = await sequelize.transaction();

  try {
    const { supplier_id } = req.params;
    const { name, phone, company } = req.body;

    const supplier = await db.supplier.findByPk(supplier_id, {
      transaction: transactionScope,
    });

    if (!supplier) {
      await transactionScope.rollback();
      return res.status(404).json({
        status: false,
        message: "Supplier not found",
      });
    }

    await supplier.update(
      {
        name,
        phone,
        company,
      },
      { transaction: transactionScope }
    );

    await transactionScope.commit();

    return res.status(200).json({
      status: true,
      message: "Supplier updated successfully",
      supplier,
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



/*
================================
Update Supplier Percentage Only
================================
*/

exports.updateSupplierPercentage = async (req, res) => {
  const transactionScope = await sequelize.transaction();

  try {
    const { supplier_id } = req.params;
    const { bonus_percentage } = req.body;

    const supplier = await db.supplier.findByPk(supplier_id, {
      transaction: transactionScope,
    });

    if (!supplier) {
      await transactionScope.rollback();
      return res.status(404).json({
        status: false,
        message: "Supplier not found",
      });
    }

    await supplier.update(
      { bonus_percentage },
      { transaction: transactionScope }
    );

    await transactionScope.commit();

    return res.status(200).json({
      status: true,
      message: "Supplier percentage updated successfully",
      supplier,
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



/*
================================
Delete Supplier
================================
*/

exports.deleteSupplier = async (req, res) => {
  const transactionScope = await sequelize.transaction();

  try {
    const { supplier_id } = req.params;

    const supplier = await db.supplier.findByPk(supplier_id, {
      transaction: transactionScope,
    });

    if (!supplier) {
      await transactionScope.rollback();
      return res.status(404).json({
        status: false,
        message: "Supplier not found",
      });
    }

    await supplier.destroy({ transaction: transactionScope });

    await transactionScope.commit();

    return res.status(200).json({
      status: true,
      message: "Supplier deleted successfully",
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


/*
================================
Change Supplier Status
================================
*/

exports.changeSupplierStatus = async (req, res) => {
  const transactionScope = await sequelize.transaction();

  try {

    const { supplier_id } = req.params;

    const supplier = await db.supplier.findByPk(supplier_id, {
      transaction: transactionScope
    });

    if (!supplier) {
      await transactionScope.rollback();
      return res.status(404).json({
        status: false,
        message: "Supplier not found"
      });
    }

    const newStatus = !supplier.status;

    await supplier.update(
      { status: newStatus },
      { transaction: transactionScope }
    );

    await transactionScope.commit();

    return res.status(200).json({
      status: true,
      message: "Supplier status updated successfully",
      supplier
    });

  } catch (error) {

    await transactionScope.rollback();
    console.error(error);

    return res.status(500).json({
      status: false,
      message: "Internal Server Error"
    });

  }
};