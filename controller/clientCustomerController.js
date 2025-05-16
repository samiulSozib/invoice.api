const {sequelize}=require('../database/database')
const db=require('../database/database')


// get client/customer by user id
exports.getClientCustomerByUserId=async(req,res,next)=>{
    const transactionScope = await sequelize.transaction();
    const user_id=req.params.user_id
    try{
        const client_customers=await db.clientCustomer.findAll({where:{user_id:user_id}},{
            transaction:transactionScope
        })
        

        await transactionScope.commit();
  
        return res.status(200).json({status: true, message: '', client_customers:client_customers })
        
    }catch(error){
        if (transactionScope) await transactionScope.rollback();
        console.log(error)
        return res.status(503).json({status:false,message:'Internal Server Error',client_customers:[]})
    }
}

// Add Client/Customer
exports.addClientCustomer = async (req, res, next) => {
    const transactionScope = await sequelize.transaction();
    const { user_id, name, phone_number, business_details } = req.body;

    try {
        const clientCustomer = await db.clientCustomer.create(
            { user_id, name, phone_number, business_details },
            { transaction: transactionScope }
        );

        await transactionScope.commit();

        return res.status(201).json({ status: true, message: 'Client/Customer added successfully', clientCustomer });
    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
        console.error(error);
        return res.status(503).json({ status: false, message: 'Internal Server Error', clientCustomer: null });
    }
};


// Edit Client/Customer
exports.editClientCustomer = async (req, res, next) => {
    const transactionScope = await sequelize.transaction();
    const { id } = req.params; // Assuming the ID is passed as a parameter
    const { name, phone_number, business_details } = req.body;

    try {
        const clientCustomer = await db.clientCustomer.findOne(
            { where: { id } },
            { transaction: transactionScope }
        );

        if (!clientCustomer) {
            return res.status(404).json({ status: false, message: 'Client/Customer not found' });
        }

        await clientCustomer.update(
            { name, phone_number, business_details },
            { transaction: transactionScope }
        );

        await transactionScope.commit();

        return res.status(200).json({ status: true, message: 'Client/Customer updated successfully', clientCustomer });
    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
        console.error(error);
        return res.status(503).json({ status: false, message: 'Internal Server Error', clientCustomer: null });
    }
};


// Delete Client/Customer
exports.deleteClientCustomer = async (req, res, next) => {
    const transactionScope = await sequelize.transaction();
    const { id } = req.params; // Assuming the ID is passed as a parameter

    try {
        const clientCustomer = await db.clientCustomer.findOne(
            { where: { id } },
            { transaction: transactionScope }
        );

        if (!clientCustomer) {
            return res.status(404).json({ status: false, message: 'Client/Customer not found' });
        }

        await clientCustomer.destroy({ transaction: transactionScope });

        await transactionScope.commit();

        return res.status(200).json({ status: true, message: 'Client/Customer deleted successfully' });
    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
        console.error(error);
        return res.status(503).json({ status: false, message: 'Internal Server Error' });
    }
};

// Get Client/Customer by ID
exports.getClientCustomerById = async (req, res, next) => {
    const transactionScope = await sequelize.transaction();
    const { id } = req.params; // Assuming the ID is passed as a parameter

    try {
        const clientCustomer = await db.clientCustomer.findOne(
            { where: { id } },
            { transaction: transactionScope }
        );

        if (!clientCustomer) {
            return res.status(404).json({ status: false, message: 'Client/Customer not found', clientCustomer: null });
        }

        await transactionScope.commit();

        return res.status(200).json({ status: true, message: 'Client/Customer fetched successfully', clientCustomer });
    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
        console.error(error);
        return res.status(503).json({ status: false, message: 'Internal Server Error', clientCustomer: null });
    }
};
