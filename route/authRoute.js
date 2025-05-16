const router=require('express').Router()
const {
    signUp,
    signIn,
    addClient,
    resetPassword,
    updateBusinessProfile,
    updateClientProfile,
    getBusinessProfile,
    getClientProfile,
    getClientsByBusinessOwner
}=require('../controller/authController')
const authenticateToken = require('../middleware/authMiddleware')
const upload = require('../middleware/upload')

router.post('/sign-up',signUp)
router.post('/sign-in',signIn)
router.post('/add-client',authenticateToken,addClient)
router.post('/reset-password',resetPassword)
router.post('/update-business-profile',authenticateToken,upload.single('thumbnail_image'),updateBusinessProfile)
router.post('/update-client-profile',authenticateToken,updateClientProfile)

router.get('/get-business-profile',authenticateToken,getBusinessProfile)
router.get('/get-client-profile',authenticateToken,getClientProfile)
router.get('/get-clients',authenticateToken,getClientsByBusinessOwner)


module.exports=router