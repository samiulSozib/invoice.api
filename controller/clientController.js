const {sequelize}=require('../database/database')
const db=require('../database/database')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const {sendEmail}=require('../services/emailService')
const {generateOtp,isOtpExpired}=require('../util/otpFuntions')
const { Op, where } = require('sequelize');
const base_url = require('../const/const')
const client = require('../model/client')





// add client

exports.addClient = async (req, res, next) => {
    let { phone_number, name,address  } = req.body;
    const business_owner_id = req.business_owner_id; // From middleware
    const business_owner = req.business_owner; // From middleware

    const transactionScope = await sequelize.transaction();
    try {
        // Check if a user with the same phone_number already exists
        const existingUser = await db.client.findOne({
            where: { phone_number:phone_number,business_owner_id:business_owner_id },
            transaction: transactionScope
        });

        // If user exists and is verified, return error
        if (existingUser) {
            await transactionScope.rollback();
            return res.status(409).json({ status: false, message: 'User Already Exists With This Phone Number', client: {} });
        }


        if(!business_owner.is_premium){
            const clientCount = await db.client.count({ where: { business_owner_id: business_owner_id } });

            if (clientCount >= 10) {
                await transactionScope.rollback();
                return res.status(400).json({ status: false, message: 'account limit reached', client: {} });
            }
        }

        const new_client=await db.client.create({
            business_owner_id:business_owner_id,
            name:name,
            phone_number,
            address:address
        },{transaction:transactionScope})


        await transactionScope.commit();

        return res.status(201).json({ status: true, message: 'Client Added', client: new_client });
    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
        console.log(error)
        return res.status(500).json({ status: false, message: 'Server Error'+error, client: {} });
    }
};




// update client profile
exports.updateClientProfile = async (req, res, next) => {
    const {client_id, name, address,phone_number } = req.body;
    const transactionScope = await sequelize.transaction();

    try {
        // Find the user by ID
        const user = await db.client.findByPk(client_id, { transaction: transactionScope });

        if (!user) {
            await transactionScope.rollback();
            return res.status(404).json({ status: false, message: 'User not found', client: {} });
        }





        // Update the user details
        await db.client.update({
            name,
            phone_number,
            address
        }, {
            where: { id: client_id },
            transaction: transactionScope
        });

        const updatedUser = await db.client.findByPk(client_id, {
            transaction: transactionScope
        });

        await transactionScope.commit();
        return res.status(201).json({ status: true, message: 'Client Profile updated successfully', client: updatedUser });
    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
        return res.status(500).json({ status: false, message: 'Server Error', client: {} });
    }
};




// get client profile
exports.getClientProfile = async (req, res, next) => {
    const client_id = req.body.client_id;
    try {
        // Find the user by ID
        const user=await db.client.findByPk(client_id)

        if (!user) {
            return res.status(404).json({ status: false, message: 'Client not found', client: {} });
        }

        return res.status(200).json({ status: true, message: 'Profile retrieved successfully', client:user });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Server Error: ', client: {} });
    }
};

// get client by business owner
exports.getClientsByBusinessOwner = async (req, res) => {
  try {
    const business_owner_id = req.business_owner_id;

    // ---------------- Pagination ----------------
    let { page = 1, item_per_page = 20, search } = req.query;

    page = parseInt(page);
    item_per_page = parseInt(item_per_page);

    const offset = (page - 1) * item_per_page;
    const limit = item_per_page;

    // ---------------- Where Clause ----------------
    const whereClause = { business_owner_id,status: true };

    // Search by name or phone
    if (search) {
      whereClause[Op.or] = [
        {
          name: {
            [Op.like]: `%${search}%`
          }
        },
        {
          phone_number: {
            [Op.like]: `%${search}%`
          }
        }
      ];
    }

    // ---------------- Query ----------------
    const { count, rows: clients } = await db.client.findAndCountAll({
      where: whereClause,
      offset,
      limit,
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      status: true,
      message: "Clients retrieved successfully",
      clients,
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
      message: "Server Error",
      clients: [],
    });
  }
};


// delete client
exports.deleteClient=async(req,res,next)=>{
    const transactionScope = await sequelize.transaction();
        const { client_id } = req.params;


        try {
            const client = await db.client.findByPk(client_id, { transaction: transactionScope });

            if (!client) {
                return res.status(404).json({ status: false, message: 'Client not found' });
            }

            //await client.destroy({ transaction: transactionScope });
            await db.client.update({ status: false }, {
                where: { id: client_id },
                transaction: transactionScope
            });

            await transactionScope.commit();

            return res.status(200).json({ status: true, message: 'Client deleted successfully' });
        } catch (error) {
            if (transactionScope) await transactionScope.rollback();
            console.error(error);
            return res.status(503).json({ status: false, message: 'Internal Server Error' });
        }
}


// GET /top-clients - Top Clients by Purchase Amount
exports.getTopClients = async (req, res) => {
  try {
    const business_owner_id = req.business_owner_id;

    const topClients = await db.client.findAll({
      where: {
        business_owner_id: business_owner_id
      },
      attributes: [
        'id',
        'name',
        'phone_number',
        'address',
        'total_due',
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(total), 0) 
            FROM invoices 
            WHERE invoices.client_id = client.id 
            AND invoices.business_owner_id = ${business_owner_id}
          )`),
          'total_purchase_amount'
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*) 
            FROM invoices 
            WHERE invoices.client_id = client.id 
            AND invoices.business_owner_id = ${business_owner_id}
          )`),
          'total_invoices'
        ],
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(payment_amount), 0) 
            FROM transaction_logs 
            WHERE transaction_logs.client_id = client.id 
            AND transaction_logs.business_owner_id = ${business_owner_id}
            AND transaction_logs.type = 'payment'
          )`),
          'total_paid'
        ]
      ],
      order: [
        [sequelize.literal('total_purchase_amount'), 'DESC']
      ],
      limit: 10,
      subQuery: false
    });

    return res.status(200).json({
      status: true,
      message: "Top clients fetched successfully",
      data: topClients
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
      data: []
    });
  }
};


// GET /top-clients-by-due - Top Clients by Outstanding Due Amount
exports.getTopClientsByDue = async (req, res) => {
  try {
    const business_owner_id = req.business_owner_id;

    const topClientsByDue = await db.client.findAll({
      where: {
        business_owner_id: business_owner_id,
        total_due: {
          [Op.gt]: 0
        }
      },
      attributes: [
        'id',
        'name',
        'phone_number',
        'address',
        'total_due',
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(total), 0) 
            FROM invoices 
            WHERE invoices.client_id = client.id 
            AND invoices.business_owner_id = ${business_owner_id}
          )`),
          'total_purchase_amount'
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*) 
            FROM invoices 
            WHERE invoices.client_id = client.id 
            AND invoices.business_owner_id = ${business_owner_id}
            AND invoices.status != 'paid'
          )`),
          'unpaid_invoices_count'
        ]
      ],
      order: [
        ['total_due', 'DESC']
      ],
      limit: 10
    });

    return res.status(200).json({
      status: true,
      message: "Top clients by due amount fetched successfully",
      data: topClientsByDue
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
      data: []
    });
  }
};