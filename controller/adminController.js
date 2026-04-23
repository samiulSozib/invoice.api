const {sequelize}=require('../database/database')
const db=require('../database/database')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const {sendEmail}=require('../services/emailService')
const {generateOtp,isOtpExpired}=require('../util/otpFuntions')
const { Op, where } = require('sequelize');
const base_url = require('../const/const')



// user login

exports.signIn=async(req,res,next)=>{
    let {username,password}=req.body
    const transactionScope = await sequelize.transaction();
    try {
  
        const admin=await db.admin.findOne({
            where:{
                username:username
            }
        },{transaction:transactionScope})

        if(!admin){
            await transactionScope.rollback()
            return res.status(404).json({status:false,message:'Admin Not Found',admin:{}})
        }

        const compare_password=await bcrypt.compare(password,admin.password)


        if(!compare_password){
            await transactionScope.rollback()
            return res.status(403).json({status:false,message:'Password does not match',admin:{}})
        }

        const token = jwt.sign({ admin_data: admin.id, }, "tokenSecretKey")

        
        await transactionScope.commit();
        
        return res.status(200).json({status: true, message: 'Sign In Success',token:token, admin:admin })
  
    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
      return res.status(500).json({status: false, message: 'Server Error', admin:{} })
    }
}


// create business owner
exports.createBusinessOwner = async (req, res) => {
    const transactionScope = await sequelize.transaction();
    try {

        let {
            name,
            address,
            phone_number,
            currency,
            password,
            date_of_birth
        } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const owner = await db.businessOwner.create({
            name,
            address,
            phone_number,
            currency,
            password: hashedPassword,
            date_of_birth,
            total_sales_amount: 0,
            total_unpaid_amount: 0,
            status: true
        }, { transaction: transactionScope });

        await transactionScope.commit();

        return res.status(201).json({
            status: true,
            message: "Business Owner Created",
            owner
        });

    } catch (error) {
        await transactionScope.rollback();
        return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }
};


// get all business owners
exports.getBusinessOwners = async (req, res) => {
    try {

        let { page = 1, limit = 10, search = "" } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        const offset = (page - 1) * limit;

        const whereCondition = search
            ? {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { phone_number: { [Op.like]: `%${search}%` } }
                ]
            }
            : {};

        const { count, rows } = await db.businessOwner.findAndCountAll({
            where: whereCondition,
            order: [['id', 'DESC']],
            limit: limit,
            offset: offset
        });

        return res.status(200).json({
            status: true,
            total_records: count,
            current_page: page,
            total_pages: Math.ceil(count / limit),
            owners: rows
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }
};


// get single business owner
exports.getBusinessOwner = async (req, res) => {
    try {

        const { id } = req.params;

        const owner = await db.businessOwner.findByPk(id);

        if (!owner) {
            return res.status(404).json({
                status: false,
                message: "Business Owner Not Found"
            });
        }

        return res.status(200).json({
            status: true,
            owner
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }
};


// update business owner
exports.updateBusinessOwner = async (req, res) => {
    const transactionScope = await sequelize.transaction();

    try {

        const { id } = req.params;

        const owner = await db.businessOwner.findByPk(id);

        if (!owner) {
            await transactionScope.rollback();
            return res.status(404).json({
                status: false,
                message: "Business Owner Not Found"
            });
        }

        let updateData = { ...req.body };

        // if password exists then hash it
        if (req.body.password) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            updateData.password = hashedPassword;
        }

        await owner.update(updateData, { transaction: transactionScope });

        await transactionScope.commit();

        return res.status(200).json({
            status: true,
            message: "Business Owner Updated",
            owner
        });

    } catch (error) {
        await transactionScope.rollback();
        return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }
};


// delete business owner
exports.deleteBusinessOwner = async (req, res) => {
    const transactionScope = await sequelize.transaction();

    try {

        const { id } = req.params;

        const owner = await db.businessOwner.findByPk(id);

        if (!owner) {
            await transactionScope.rollback();
            return res.status(404).json({
                status: false,
                message: "Business Owner Not Found"
            });
        }

        await owner.destroy({ transaction: transactionScope });

        await transactionScope.commit();

        return res.status(200).json({
            status: true,
            message: "Business Owner Deleted"
        });

    } catch (error) {
        await transactionScope.rollback();
        return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }
};

// change business owner status
exports.changeBusinessOwnerStatus = async (req, res) => {
    const transactionScope = await sequelize.transaction();

    try {

        const { id } = req.params;

        const owner = await db.businessOwner.findByPk(id);

        if (!owner) {
            await transactionScope.rollback();
            return res.status(404).json({
                status: false,
                message: "Business Owner Not Found"
            });
        }

        owner.status = !owner.status;

        await owner.save({ transaction: transactionScope });

        await transactionScope.commit();

        return res.status(200).json({
            status: true,
            message: "Status Updated",
            status_value: owner.status
        });

    } catch (error) {
        await transactionScope.rollback();
        return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }
};


// dashboard business owner stats
exports.businessOwnerStats = async (req, res) => {
    try {

        const total = await db.businessOwner.count();

        const active = await db.businessOwner.count({
            where: { status: true }
        });

        const inactive = await db.businessOwner.count({
            where: { status: false }
        });

        return res.status(200).json({
            status: true,
            total_businessOwners: total,
            total_active_businessOwners: active,
            total_inactive_businessOwners: inactive
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }
};