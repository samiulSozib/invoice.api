const router=require('express').Router()
const upload=require('../middleware/upload')
const {extractCardInfo,insertCardInfo,getCardInfoById,getCardInfoByUserId,getCardInfoByUserIdAndCategory,deleteCardInfo,updateCardInfo}=require('../controller/cardController')

router.post('/extract-card-info',extractCardInfo)
router.post('/add-card',upload.fields([{name:'card_image1'},{name:'card_image2'}]),insertCardInfo)
router.get('/get-by-id',getCardInfoById)
router.get('/get-by-user-id',getCardInfoByUserId)
router.get('/get-by-user-id-and-category-id',getCardInfoByUserIdAndCategory)
router.delete('/delete',deleteCardInfo)
router.post('/update-card',upload.fields([{name:'card_image1'},{name:'card_image2'}]),updateCardInfo)


module.exports=router