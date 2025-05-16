const router=require('express').Router()
const {getBusinessEmailByUserId,addBusinessEmail,editBusinessEmail,deleteBusinessEmail,getBusinessEmailById}=require('../controller/businessEmailController')


router.get('/get-by-user-id/:user_id',getBusinessEmailByUserId)
router.get('/get-by-id/:id',getBusinessEmailById)
router.post('/add',addBusinessEmail)
router.put('/edit/:id',editBusinessEmail)
router.delete('/delete/:id',deleteBusinessEmail)


module.exports=router