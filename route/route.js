const authRouter=require('./authRoute')
const cardRoute=require('./cardRoute')
const categoryRoute=require('./categoryRoute')
const countryRoute=require('./countryRoute')
const noteRote=require('./noteRoute')
const clientCustomerRoute=require('./clientCustomerRoute')
const businessEmailRoute=require('./businessEmailRoute')
const shopRoute=require('./shopRoute')
const productCategoriesRoute=require('./productCategoryRoute')
const productRoute=require('./productRoute')


const routes = [
    {
        path:'/products',
        handler:productRoute
    },
    {
        path:'/product-categories',
        handler:productCategoriesRoute
    },
    {
        path:'/shops',
        handler:shopRoute
    },
    {
        path:'/business-emails',
        handler:businessEmailRoute
    },
    {
        path:'/client-customers',
        handler:clientCustomerRoute
    },
    {
        path:'/notes',
        handler:noteRote
    },
    {
        path:'/countries',
        handler:countryRoute
    },
    {
        path:'/categories',
        handler:categoryRoute
    },
    {
        path:'/card',
        handler:cardRoute
    },
    {
        path:'/auth',
        handler:authRouter
    },
    {
        path: '/',
        handler: (req,res)=>{
            res.send({msg:'Welcome'})
        }
    },
   
]

module.exports = (app) => {
    routes.forEach(r => {
        if (r.path == '/') {
            app.use(r.path, r.handler)
        } else {
            app.use(r.path, r.handler)
        }
    })
}