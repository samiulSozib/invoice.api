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
    getClientsByBusinessOwner,
    deleteClient,
    makePremium
}=require('../controller/authController')
const authenticateToken = require('../middleware/authMiddleware')
const upload = require('../middleware/upload')

router.post('/sign-up',signUp)
router.post('/sign-in',signIn)
router.post('/reset-password',resetPassword)
router.post('/update-business-profile',authenticateToken,upload.single('thumbnail_image'),updateBusinessProfile)

router.get('/get-business-profile',authenticateToken,getBusinessProfile)
router.post('/make-premium',authenticateToken,makePremium)



module.exports=router