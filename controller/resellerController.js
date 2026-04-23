const { Op } = require("sequelize");
const { sequelize } = require("../database/database");
const db = require("../database/database");


/*
================================
Get Resellers
================================
*/

exports.getResellers = async (req, res) => {
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

    const { count, rows: resellers } = await db.reseller.findAndCountAll({
      where: whereClause,
      offset,
      limit: item_per_page,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      status: true,
      message: "Resellers fetched successfully",
      resellers,
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
      resellers: [],
    });

  }
};



/*
================================
Add Reseller
================================
*/

exports.createReseller = async (req, res) => {

  const transactionScope = await sequelize.transaction();

  try {

    const business_owner_id = req.business_owner_id;

    const { name, phone, city, bonus_percentage } = req.body;

    const reseller = await db.reseller.create(
      {
        business_owner_id,
        name,
        phone,
        city,
        bonus_percentage,
      },
      { transaction: transactionScope }
    );

    await transactionScope.commit();

    return res.status(201).json({
      status: true,
      message: "Reseller created successfully",
      reseller,
    });

  } catch (error) {

    await transactionScope.rollback();
    console.error(error);

    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      reseller: null,
    });

  }
};



/*
================================
Update Reseller
================================
*/

exports.updateReseller = async (req, res) => {

  const transactionScope = await sequelize.transaction();

  try {

    const { reseller_id } = req.params;
    const { name, phone, city } = req.body;

    const reseller = await db.reseller.findByPk(reseller_id, {
      transaction: transactionScope,
    });

    if (!reseller) {
      await transactionScope.rollback();
      return res.status(404).json({
        status: false,
        message: "Reseller not found",
      });
    }

    await reseller.update(
      {
        name,
        phone,
        city,
      },
      { transaction: transactionScope }
    );

    await transactionScope.commit();

    return res.status(200).json({
      status: true,
      message: "Reseller updated successfully",
      reseller,
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
Update Reseller Percentage Only
================================
*/

exports.updateResellerPercentage = async (req, res) => {

  const transactionScope = await sequelize.transaction();

  try {

    const { reseller_id } = req.params;
    const { bonus_percentage } = req.body;

    const reseller = await db.reseller.findByPk(reseller_id, {
      transaction: transactionScope,
    });

    if (!reseller) {
      await transactionScope.rollback();
      return res.status(404).json({
        status: false,
        message: "Reseller not found",
      });
    }

    await reseller.update(
      { bonus_percentage },
      { transaction: transactionScope }
    );

    await transactionScope.commit();

    return res.status(200).json({
      status: true,
      message: "Reseller percentage updated successfully",
      reseller,
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
Delete Reseller
================================
*/

exports.deleteReseller = async (req, res) => {

  const transactionScope = await sequelize.transaction();

  try {

    const { reseller_id } = req.params;

    const reseller = await db.reseller.findByPk(reseller_id, {
      transaction: transactionScope,
    });

    if (!reseller) {
      await transactionScope.rollback();
      return res.status(404).json({
        status: false,
        message: "Reseller not found",
      });
    }

    await reseller.destroy({ transaction: transactionScope });

    await transactionScope.commit();

    return res.status(200).json({
      status: true,
      message: "Reseller deleted successfully",
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
Change Reseller Status
================================
*/

exports.changeResellerStatus = async (req, res) => {

  const transactionScope = await sequelize.transaction();

  try {

    const { reseller_id } = req.params;

    const reseller = await db.reseller.findByPk(reseller_id, {
      transaction: transactionScope,
    });

    if (!reseller) {
      await transactionScope.rollback();
      return res.status(404).json({
        status: false,
        message: "Reseller not found",
      });
    }

    const newStatus = !reseller.status;

    await reseller.update(
      { status: newStatus },
      { transaction: transactionScope }
    );

    await transactionScope.commit();

    return res.status(200).json({
      status: true,
      message: "Reseller status updated successfully",
      reseller,
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