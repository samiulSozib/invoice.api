const router=require('express').Router()
const {
    signIn,
    createBusinessOwner,
    getBusinessOwners,
    getBusinessOwner,
    updateBusinessOwner,
    deleteBusinessOwner,
    changeBusinessOwnerStatus,
    businessOwnerStats,
 
}=require('../controller/adminController');
const adminAuthenticateToken = require('../middleware/adminAuthMiddleware');
const authenticateToken = require('../middleware/authMiddleware')

router.post('/sign-in',signIn)

router.post('/business-owner',adminAuthenticateToken, createBusinessOwner);
router.get('/business-owner',adminAuthenticateToken, getBusinessOwners);
router.get('/business-owner/:id',adminAuthenticateToken, getBusinessOwner);
router.put('/business-owner/:id',adminAuthenticateToken, updateBusinessOwner);
router.delete('/business-owner/:id',adminAuthenticateToken, deleteBusinessOwner);
router.patch('/business-owner-status/:id',adminAuthenticateToken, changeBusinessOwnerStatus);
router.get('/business-owner-stats',adminAuthenticateToken, businessOwnerStats);


module.exports=router