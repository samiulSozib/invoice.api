const {sequelize}=require('../database/database')
const db=require('../database/database')
const OpenAI=require('openai')
const base_url = require('../const/const')



// extract card info 
exports.extractCardInfo=async(req,res,next)=>{
    let {card_info}=req.body
    try{
        
        const response = await openai.chat.completions.create({
            messages: [{ role: 'user', content: card_info+' give me json full_name,phone_number,email,company_name,designation,address,website,facebook,twitter,instagram,linkedin from this card inforamtion' }],
            model: 'gpt-3.5-turbo',
          });

          const data=response.choices[0].message.content
          

          return res.json(JSON.parse(data))

    }catch(e){
        console.log(e)
        return res.status(503).json({status:false,message:'Internal Server Error',card_info:{}})
    }
}

// insert card 
exports.insertCardInfo=async(req,res,next)=>{
    let user_id=req.query.user_id
    let {category_id,category_name,full_name,phone_number,email,company_name,designation,address,website,facebook,twitter,instagram,linkedin}=req.body  
    const transactionScope = await sequelize.transaction();
    try{

        let card_image1=null
        let card_image2=null
                
        console.log(req.files)
        if(req.files.card_image1){
            card_image1=`${base_url}/uploads/${req.files.card_image1[0].filename}`
            //card_image2=`${base_url}/uploads/${req.files.card_image2[0].filename}`
        }
        if(req.files.card_image2){
            //card_image1=`${base_url}/uploads/${req.files.card_image1[0].filename}`
            card_image2=`${base_url}/uploads/${req.files.card_image2[0].filename}`
        }

        const new_card=await db.card.create({
            user_id,
            category_id,
            category_name,
            full_name,
            phone_number,
            email,
            company_name,
            designation,
            address,
            website,
            facebook,
            twitter,
            instagram,
            linkedin,
            card_image1,
            card_image2
        },{transaction:transactionScope})

        await transactionScope.commit();
  
        return res.status(200).json({status: true, message: '', card:new_card })
        
    }catch(error){
        if (transactionScope) await transactionScope.rollback();
        console.log(error)
        return res.status(503).json({status:false,message:'Internal Server Error',user:{}})
    }
}

// get card by id 
exports.getCardInfoById=async(req,res,next)=>{
    let card_id=req.query.card_id
    const transactionScope = await sequelize.transaction();
    try{
        const card_info=await db.card.findByPk(card_id,{transaction:transactionScope})
        
        if(!card_info){
            await transactionScope.rollback()
            return res.status(404).json({status:false,message:'Card Not Found',card:{}})
        }

        await transactionScope.commit();
  
        return res.status(200).json({status: true, message: '', card:card_info })
        
    }catch(error){
        if (transactionScope) await transactionScope.rollback();
        console.log(error)
        return res.status(503).json({status:false,message:'Internal Server Error',user:{}})
    }
}

// get card by user id 
exports.getCardInfoByUserId=async(req,res,next)=>{
    let user_id=req.query.user_id
    const transactionScope = await sequelize.transaction();
    try{
        const card_infos=await db.card.findAll({
            where:{
                user_id:user_id
            }
        },{
            transaction:transactionScope
        })
        

        await transactionScope.commit();
  
        return res.status(200).json({status: true, message: '', card:card_infos })
        
    }catch(error){
        if (transactionScope) await transactionScope.rollback();
        console.log(error)
        return res.status(503).json({status:false,message:'Internal Server Error',user:{}})
    }
}

// get card by user id and category_id
exports.getCardInfoByUserIdAndCategory=async(req,res,next)=>{
    let user_id=req.query.user_id
    let category_id=req.query.category_id
    const transactionScope = await sequelize.transaction();
    try{
        const card_infos=await db.card.findAll({
            where:{
                user_id:user_id,
                category_id:category_id
            }
        },{
            transaction:transactionScope
        })
        

        await transactionScope.commit();
  
        return res.status(200).json({status: true, message: '', card:card_infos })
        
    }catch(error){
        if (transactionScope) await transactionScope.rollback();
        console.log(error)
        return res.status(503).json({status:false,message:'Internal Server Error',user:{}})
    }
}

// Update card info
exports.updateCardInfo = async (req, res, next) => {
    let card_id = req.query.card_id;
    let { category_id, category_name, full_name, phone_number, email, company_name, designation, address, website, facebook, twitter, instagram, linkedin } = req.body;
    const transactionScope = await sequelize.transaction();
    try {
        // Fetch the existing card
        const existingCard = await db.card.findByPk(card_id, { transaction: transactionScope });

        if (!existingCard) {
            await transactionScope.rollback();
            return res.status(404).json({ status: false, message: 'Card not found', card: {} });
        }

        let card_image1 = existingCard.card_image1;
        let card_image2 = existingCard.card_image2;

        // Handle file uploads
        if (req.files && req.files.card_image1) {
            card_image1 = `${base_url}/uploads/${req.files.card_image1[0].filename}`;
        }
        if (req.files && req.files.card_image2) {
            card_image2 = `${base_url}/uploads/${req.files.card_image2[0].filename}`;
        }

        // Update card details
        existingCard.category_id = category_id;
        existingCard.category_name = category_name;
        existingCard.full_name = full_name;
        existingCard.phone_number = phone_number;
        existingCard.email = email;
        existingCard.company_name = company_name;
        existingCard.designation = designation;
        existingCard.address = address;
        existingCard.website = website;
        existingCard.facebook = facebook;
        existingCard.twitter = twitter;
        existingCard.instagram = instagram;
        existingCard.linkedin = linkedin;
        existingCard.card_image1 = card_image1;
        existingCard.card_image2 = card_image2;

        await existingCard.save({ transaction: transactionScope });

        await transactionScope.commit();

        return res.status(200).json({ status: true, message: 'Card updated successfully', card: existingCard });

    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
        console.log(error);
        return res.status(503).json({ status: false, message: 'Internal Server Error', card: {} });
    }
}

// Delete card info
exports.deleteCardInfo = async (req, res, next) => {
    let card_id = req.query.card_id;
    const transactionScope = await sequelize.transaction();
    try {
        // Fetch the existing card
        const existingCard = await db.card.findByPk(card_id, { transaction: transactionScope });

        if (!existingCard) {
            await transactionScope.rollback();
            return res.status(404).json({ status: false, message: 'Card not found', card: {} });
        }

        // Delete the card
        await existingCard.destroy({ transaction: transactionScope });

        await transactionScope.commit();

        return res.status(200).json({ status: true, message: 'Card deleted successfully',card:existingCard });

    } catch (error) {
        if (transactionScope) await transactionScope.rollback();
        console.log(error);
        return res.status(503).json({ status: false, message: 'Internal Server Error', card: {} });
    }
};