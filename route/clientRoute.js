const router=require('express').Router()

const { addClient, updateClientProfile, getClientProfile, getClientsByBusinessOwner, deleteClient, getTopClientsByDue, getTopClients } = require('../controller/clientController')
const authenticateToken = require('../middleware/authMiddleware')
const upload = require('../middleware/upload')


router.post('/add-client',authenticateToken,addClient)
router.post('/update-client-profile',authenticateToken,updateClientProfile)

router.get('/get-client-profile',authenticateToken,getClientProfile)
router.get('/get-clients',authenticateToken,getClientsByBusinessOwner)
router.delete('/delete-client/:client_id',authenticateToken,deleteClient)

router.get('/top-clients',authenticateToken, getTopClients);
router.get('/top-clients-by-due',authenticateToken, getTopClientsByDue);



module.exports=router