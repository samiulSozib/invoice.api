const {sequelize}=require('../database/database')
const db=require('../database/database')


// get shops by user id
exports.getShopsByBusinessOwnerId=async(req,res,next)=>{
    const transactionScope = await sequelize.transaction();
    const business_owner_id=req.business_owner_id
    try{
        const shops=await db.shop.findAll({where:{business_owner_id:business_owner_id}},{
            transaction:transactionScope
        })
        

        await transactionScope.commit();
  
        return res.status(200).json({status: true, message: '', shops:shops })
        
    }catch(error){
        if (transactionScope) await transactionScope.rollback();
        console.log(error)
        return res.status(503).json({status:false,message:'Internal Server Error',shops:[]})
    }
}

// Create Shop
exports.createShop = async (req, res, next) => {
    const transactionScope = await sequelize.transaction();
    const { name, address, phone_number_1,phone_number_2,website } = req.body;
    const business_owner_id=req.business_owner_id
    let logo=null
    console.log(business_owner_id)
    try {
        if(req.file){
            logo=`/uploads/${req.file.filename}`
        }
        const shop = await db.shop.create(
            { business_owner_id:business_owner_id, name,address,phone_number_1,phone_number_2,website,logo },
            { transaction: transactionScope }
        );

        await transactionScope.commit();

        return res.status(201).json({ status: true, message: 'Shop created successfully', shop });
    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
        console.error(error);
        return res.status(503).json({ status: false, message: 'Internal Server Error', shop: null });
    }
};


// Edit Shop
exports.editShop = async (req, res, next) => {
    const transactionScope = await sequelize.transaction();
    const { shop_id } = req.params;
    const { name, address, phone_number_1, phone_number_2, website } = req.body;
    let logo = null;

    try {
        const shop = await db.shop.findOne({ where: { id: shop_id }, transaction: transactionScope });

        if (!shop) {
            await transactionScope.rollback();
            return res.status(404).json({ status: false, message: 'Shop not found' });
        }

        if (req.file) {
            logo = `/uploads/${req.file.filename}`;
        }

        await shop.update(
            { name, address, phone_number_1, phone_number_2, website, ...(logo && { logo }) },
            { transaction: transactionScope }
        );

        await transactionScope.commit();

        return res.status(200).json({ status: true, message: 'Shop updated successfully', shop });
    } catch (error) {
        await transactionScope.rollback();
        console.error(error);
        return res.status(503).json({ status: false, message: 'Internal Server Error', shop: null });
    }
};


// Delete Shop
exports.deleteShop = async (req, res, next) => {
    const transactionScope = await sequelize.transaction();
    const { shop_id } = req.params;

    try {
        const shop = await db.shop.findOne({ where: { id: shop_id }, transaction: transactionScope });

        if (!shop) {
            await transactionScope.rollback();
            return res.status(404).json({ status: false, message: 'Shop not found' });
        }

        await shop.destroy({ transaction: transactionScope });

        await transactionScope.commit();

        return res.status(200).json({ status: true, message: 'Shop deleted successfully' });
    } catch (error) {
        await transactionScope.rollback();
        console.error(error);
        return res.status(503).json({ status: false, message: 'Internal Server Error' });
    }
};



// Get Shop by ID
exports.getShopById = async (req, res, next) => {
    const transactionScope = await sequelize.transaction();
    const { shop_id } = req.params;

    try {
        const shop = await db.shop.findByPk(shop_id, { transaction: transactionScope });

        if (!shop) {
            await transactionScope.rollback();
            return res.status(404).json({ status: false, message: 'Shop not found', shop: null });
        }

        await transactionScope.commit();

        return res.status(200).json({ status: true, message: 'Shop fetched successfully', shop });
    } catch (error) {
        await transactionScope.rollback();
        console.error(error);
        return res.status(503).json({ status: false, message: 'Internal Server Error', shop: null });
    }
};
