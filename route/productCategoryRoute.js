const router=require('express').Router()
const { getProductCategory }=require('../controller/productCategoryController');
const authenticateToken = require('../middleware/authMiddleware');


router.get('/',authenticateToken,getProductCategory)




module.exports=router