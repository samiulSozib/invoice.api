const {sequelize}=require('../database/database')
const db=require('../database/database')


// get all country
exports.getCountries=async(req,res,next)=>{
    const transactionScope = await sequelize.transaction();
    try{
        const countries=await db.country.findAll({
            transaction:transactionScope
        })
        

        await transactionScope.commit();
  
        return res.status(200).json({status: true, message: '', countries:countries })
        
    }catch(error){
        if (transactionScope) await transactionScope.rollback();
        console.log(error)
        return res.status(503).json({status:false,message:'Internal Server Error',countries:[]})
    }
}