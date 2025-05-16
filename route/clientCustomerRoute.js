const router=require('express').Router()
const {getClientCustomerByUserId,addClientCustomer,editClientCustomer,deleteClientCustomer,getClientCustomerById}=require('../controller/clientCustomerController')


router.get('/get-by-user-id/:user_id',getClientCustomerByUserId)
router.get('/get-by-id/:id',getClientCustomerById)
router.post('/add',addClientCustomer)
router.put('/edit/:id',editClientCustomer)
router.delete('/delete/:id',deleteClientCustomer)


module.exports=router