const {sequelize}=require('../database/database')
const db=require('../database/database')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const {sendEmail}=require('../services/emailService')
const {generateOtp,isOtpExpired}=require('../util/otpFuntions')
const { Op, where } = require('sequelize');
const base_url = require('../const/const')



// user signUp

exports.signUp = async (req, res, next) => {
    let { phone_number, password,date_of_birth } = req.body;
    const transactionScope = await sequelize.transaction();
    try {
        // Check if a user with the same phone_number already exists
        const existingUser = await db.businessOwner.findOne({
            where: { phone_number },
            transaction: transactionScope
        });

        // If user exists and is verified, return error
        if (existingUser) {
            await transactionScope.rollback();
            return res.status(200).json({ status: false, message: 'User Already Exists With This Phone Number', business_owner: {} });
        }

        
        // If user does not exist, create a new one

        const hashedPassword = await bcrypt.hash(password, 10);
        const new_user = await db.businessOwner.create({
            phone_number,
            date_of_birth,
            password:hashedPassword, 
            
        }, { transaction: transactionScope });

        
      

        await transactionScope.commit();

        return res.status(200).json({ status: true, message: 'Registration Success', business_owner: new_user });
    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
        console.log(error)
        return res.status(500).json({ status: false, message: 'Server Error'+error, business_owner: {} });
    }
};


// user login

exports.signIn=async(req,res,next)=>{
    let {phone_number,password}=req.body
    const transactionScope = await sequelize.transaction();
    try {
  
        const user=await db.businessOwner.findOne({
            where:{
                phone_number:phone_number
            }
        },{transaction:transactionScope})

        if(!user){
            await transactionScope.rollback()
            return res.status(404).json({status:false,message:'User Not Found',business_owner:{}})
        }

        const compare_password=await bcrypt.compare(password,user.password)


        if(!compare_password){
            await transactionScope.rollback()
            return res.status(403).json({status:false,message:'Password does not match',business_owner:{}})
        }

        const token = jwt.sign({ business_owner_date: user.id, }, "tokenSecretKey")

        
        await transactionScope.commit();
  
        return res.status(200).json({status: true, message: 'Sign In Success',token:token, business_owner:user })
  
    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
      return res.status(500).json({status: false, message: 'Server Error', business_owner:{} })
    }
}


// add client

exports.addClient = async (req, res, next) => {
    let { phone_number, name,address  } = req.body;
    const business_owner_id = req.business_owner_id; // From middleware

    const transactionScope = await sequelize.transaction();
    try {
        console.log(phone_number,name,address,business_owner_id)
        // Check if a user with the same phone_number already exists
        const existingUser = await db.client.findOne({
            where: { phone_number:phone_number,business_owner_id:business_owner_id },
            transaction: transactionScope
        });

        // If user exists and is verified, return error
        if (existingUser) {
            await transactionScope.rollback();
            return res.status(200).json({ status: false, message: 'User Already Exists With This Phone Number', client: {} });
        }

        


        const new_client=await db.client.create({
            business_owner_id:business_owner_id,
            name:name,
            phone_number,
            address:address
        },{transaction:transactionScope})
      

        await transactionScope.commit();

        return res.status(200).json({ status: true, message: 'Client Added', client: new_client });
    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
        console.log(error)
        return res.status(500).json({ status: false, message: 'Server Error'+error, client: {} });
    }
};


// user reset password

exports.resetPassword=async(req,res,next)=>{
    let {phone_number,date_of_birth,password}=req.body
    const transactionScope = await sequelize.transaction();
    try {
        console.log(phone_number)
        const user = await db.businessOwner.findOne({
            where: {
                [Op.and]:[
                    {
                        phone_number:phone_number
                    },
                    {
                        date_of_birth:date_of_birth
                    }
                    
                ]
            },
            transaction: transactionScope // Move transaction option here
        });
        

        if(!user){
            await transactionScope.rollback()
            return res.status(404).json({status:false,message:'Business Owner Not Found',business_owner:{}})
        }



        password=await bcrypt.hash(password,10)

        await db.businessOwner.update({password:password},{
            where:{
                phone_number:phone_number
            },
        },{transaction:transactionScope})

        

        
        await transactionScope.commit();
  
        return res.status(200).json({status: true, message: 'Password Update Success', business_owner:user })
  
    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
        console.log(error)
      return res.status(500).json({status: false, message: 'Server Error', business_owner:{} })
    }
}



// update business profile
exports.updateBusinessProfile = async (req, res, next) => {
    const business_owner_id = req.business_owner_id; 
    const { name, address } = req.body;
    const transactionScope = await sequelize.transaction();

    try {
        // Find the user by ID
        const user = await db.businessOwner.findByPk(business_owner_id, { transaction: transactionScope });

        if (!user) {
            await transactionScope.rollback();
            return res.status(404).json({ status: false, message: 'User not found', user: {} });
        }

        let profile_image=user.thumbnail_image

        if(req.file){
            profile_image=`/uploads/${req.file.filename}`
        }


        // Update the user details
        await db.businessOwner.update({
            name,
            thumbnail_image:profile_image,
            address
        }, {
            where: { id: business_owner_id },
            transaction: transactionScope
        });

        const updatedUser = await db.businessOwner.findByPk(business_owner_id, {transaction: transactionScope});

        await transactionScope.commit();
        return res.status(200).json({ status: true, message: 'Business Profile updated successfully', business_owner: updatedUser });
    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
        console.log(error)
        return res.status(500).json({ status: false, message: 'Server Error', user: {} });
    }
};

// update client profile
exports.updateClientProfile = async (req, res, next) => {
    const {client_id, name, address } = req.body;
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
            address
        }, {
            where: { id: client_id },
            transaction: transactionScope
        });

        const updatedUser = await db.client.findByPk(client_id, {
            transaction: transactionScope
        });

        await transactionScope.commit();
        return res.status(200).json({ status: true, message: 'Client Profile updated successfully', client: updatedUser });
    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
        return res.status(500).json({ status: false, message: 'Server Error', client: {} });
    }
};

// get business profile
exports.getBusinessProfile = async (req, res, next) => {
    const business_owner_id = req.business_owner_id;
    try {
        // Find the user by ID
        const user=await db.businessOwner.findByPk(business_owner_id)

        if (!user) {
            return res.status(404).json({ status: false, message: 'Business Owner not found', business_owner: {} });
        }

        return res.status(200).json({ status: true, message: 'Profile retrieved successfully', business_owner:user });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Server Error: ', business_owner: {} });
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
exports.getClientsByBusinessOwner = async (req, res, next) => {
    const business_owner_id = req.business_owner_id;
    try {
        // Find the user by ID
        const users=await db.client.findAll({where:{business_owner_id:business_owner_id}})


        return res.status(200).json({ status: true, message: 'Clients retrieved successfully', clients:users });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Server Error: ', clients: {} });
    }
};