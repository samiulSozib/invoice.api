const router=require('express').Router()
const {getCategories}=require('../controller/categoryController')


router.get('/',getCategories)


module.exports=router