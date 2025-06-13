const router=require('express').Router()
const {getInvoiceList, getInvoiceById, createInvoice, getInvoiceListByClientId}=require('../controller/invoiceController')
const authenticateToken = require('../middleware/authMiddleware')


router.get('/invoice-list',authenticateToken,getInvoiceList)
router.get('/:invoice_id',authenticateToken,getInvoiceById)
router.post('/create',authenticateToken,createInvoice)


module.exports=router