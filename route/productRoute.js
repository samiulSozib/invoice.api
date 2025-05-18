const router=require('express').Router()
const { getProducts, getProductsByCategoryId, createProduct, editProduct, deleteProduct, getProductById }=require('../controller/productController');
const authenticateToken = require('../middleware/authMiddleware');


router.get('/',authenticateToken,getProducts)
router.get('/category/:category_id',authenticateToken,getProductsByCategoryId)
router.post('/create',authenticateToken, createProduct); 
router.put('/edit/:product_id',authenticateToken, editProduct); 
router.delete('/delete/:product_id',authenticateToken, deleteProduct);
router.get('/:product_id',authenticateToken, getProductById);



module.exports=router