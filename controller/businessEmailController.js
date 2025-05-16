const {sequelize}=require('../database/database')
const db=require('../database/database')


// get business email by user id
exports.getBusinessEmailByUserId=async(req,res,next)=>{
    const transactionScope = await sequelize.transaction();
    const user_id=req.params.user_id
    try{
        const business_emails=await db.businessEmail.findAll({where:{user_id:user_id}},{
            transaction:transactionScope
        })
        

        await transactionScope.commit();
  
        return res.status(200).json({status: true, message: '', business_emails:business_emails })
        
    }catch(error){
        if (transactionScope) await transactionScope.rollback();
        console.log(error)
        return res.status(503).json({status:false,message:'Internal Server Error',business_emails:[]})
    }
}


// Add Business Email
exports.addBusinessEmail = async (req, res, next) => {
    const transactionScope = await sequelize.transaction();
    const { user_id, name, email } = req.body;

    try {
        const businessEmail = await db.businessEmail.create(
            { user_id, name, email },
            { transaction: transactionScope }
        );

        await transactionScope.commit();

        return res.status(201).json({ status: true, message: 'Business Email added successfully', businessEmail });
    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
        console.error(error);
        return res.status(503).json({ status: false, message: 'Internal Server Error', businessEmail: null });
    }
};


// Edit Business Email
exports.editBusinessEmail = async (req, res, next) => {
    const transactionScope = await sequelize.transaction();
    const { id } = req.params; // Assuming the ID is passed as a parameter
    const { name, email } = req.body;

    try {
        const businessEmail = await db.businessEmail.findOne(
            { where: { id } },
            { transaction: transactionScope }
        );

        if (!businessEmail) {
            return res.status(404).json({ status: false, message: 'Business Email not found' });
        }

        await businessEmail.update(
            { name, email },
            { transaction: transactionScope }
        );

        await transactionScope.commit();

        return res.status(200).json({ status: true, message: 'Business Email updated successfully', businessEmail });
    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
        console.error(error);
        return res.status(503).json({ status: false, message: 'Internal Server Error', businessEmail: null });
    }
};


// Delete Business Email
exports.deleteBusinessEmail = async (req, res, next) => {
    const transactionScope = await sequelize.transaction();
    const { id } = req.params; // Assuming the ID is passed as a parameter

    try {
        const businessEmail = await db.businessEmail.findOne(
            { where: { id } },
            { transaction: transactionScope }
        );

        if (!businessEmail) {
            return res.status(404).json({ status: false, message: 'Business Email not found' });
        }

        await businessEmail.destroy({ transaction: transactionScope });

        await transactionScope.commit();

        return res.status(200).json({ status: true, message: 'Business Email deleted successfully' });
    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
        console.error(error);
        return res.status(503).json({ status: false, message: 'Internal Server Error' });
    }
};


// Get Business Email by ID
exports.getBusinessEmailById = async (req, res, next) => {
    const transactionScope = await sequelize.transaction();
    const { id } = req.params; // Assuming the ID is passed as a parameter

    try {
        const businessEmail = await db.businessEmail.findOne(
            { where: { id } },
            { transaction: transactionScope }
        );

        if (!businessEmail) {
            return res.status(404).json({ status: false, message: 'Business Email not found', businessEmail: null });
        }

        await transactionScope.commit();

        return res.status(200).json({ status: true, message: 'Business Email fetched successfully', businessEmail });
    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
        console.error(error);
        return res.status(503).json({ status: false, message: 'Internal Server Error', businessEmail: null });
    }
};
