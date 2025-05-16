require('dotenv').config()

const express = require('express')
const cors=require('cors')



const setMiddlewares = require('./middleware/middleware')
const setRoutes = require('./route/route')



const app = express()
app.use(cors());


require('./database/database')

setMiddlewares(app)
setRoutes(app)
require('./util/scheduler')

app.listen(3333, () => {
    console.log('server create success on port 3333')
})