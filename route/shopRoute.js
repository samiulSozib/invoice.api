const router=require('express').Router()
const { getShopsByBusinessOwnerId, createShop, editShop, deleteShop, getShopById }=require('../controller/shopController');
const authenticateToken = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');


router.get('/',authenticateToken,getShopsByBusinessOwnerId)
router.post('/create',upload.single('logo'),authenticateToken, createShop); 
router.put('/edit/:shop_id',upload.single('logo'),authenticateToken, editShop); 
router.delete('/:shop_id',authenticateToken, deleteShop);
router.get('/:shop_id',authenticateToken, getShopById);



module.exports=router