const router=require('express').Router()
const {getCountries}=require('../controller/countryController')


router.get('/',getCountries)


module.exports=router