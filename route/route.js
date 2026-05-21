const authRouter = require('./authRoute')
const shopRoute = require('./shopRoute')
const productCategoriesRoute = require('./productCategoryRoute')
const productRoute = require('./productRoute')
const invoiceRoute = require('./invoiceRoute')
const transactionLogRoute = require('./transactionLogRoute')
const adminRoute = require('./adminRoute')
const clientRoute = require('./clientRoute')


const routes = [
    {
        path:'/client',
        handler:clientRoute
    },
    {
        path: '/admin',
        handler: adminRoute
    },

    {
        path: '/transaction-log',
        handler: transactionLogRoute
    },
    {
        path: '/invoice',
        handler: invoiceRoute
    },
    {
        path: '/products',
        handler: productRoute
    },
    {
        path: '/product-categories',
        handler: productCategoriesRoute
    },
    {
        path: '/shops',
        handler: shopRoute
    },


    {
        path: '/auth',
        handler: authRouter
    },
    {
        path: '/',
        handler: (req, res) => {
            res.send({ msg: 'Welcome' })
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