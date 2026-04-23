const router=require('express').Router()
const {getInvoiceList, getInvoiceById, createInvoice, getInvoiceListByClientId,payDue, deleteInvoice}=require('../controller/invoiceController')
const authenticateToken = require('../middleware/authMiddleware')


router.post('/pay-due/:invoice_id',authenticateToken,payDue)

router.get('/invoice-list',authenticateToken,getInvoiceList)
router.get('/:invoice_id',authenticateToken,getInvoiceById)
router.post('/create',authenticateToken,createInvoice)


router.delete("/:invoice_id",authenticateToken, deleteInvoice);
// router.delete("/",authenticateToken, deleteMultipleInvoices);


module.exports=router