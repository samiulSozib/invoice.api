const {sequelize}=require('../database/database')
const db=require('../database/database')


// get product category
exports.getProductCategory=async(req,res,next)=>{
    const transactionScope = await sequelize.transaction();
    try{
        const productCategories=await db.productCategory.findAll({
            transaction:transactionScope
        })
        

        await transactionScope.commit();
  
        return res.status(200).json({status: true, message: '', product_categories:productCategories })
        
    }catch(error){
        if (transactionScope) await transactionScope.rollback();
        console.log(error)
        return res.status(503).json({status:false,message:'Internal Server Error',product_categories:[]})
    }
}
