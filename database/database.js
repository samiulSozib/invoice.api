const { Sequelize, DataTypes } = require('sequelize')

// const sequelize = new Sequelize('samiulcs_invoice', 'samiulcs_invoice', 'R?OraWfgUqSK', {
//     host: 'localhost',
//     dialect: 'mysql',
//     pool: { max: 5, min: 0, idle: 10000 }
// })

const sequelize = new Sequelize('invoice', 'root', '', {
    host: 'localhost',
    logging: true,
    dialect: 'mysql',
    pool: { max: 5, min: 0, idle: 10000 }
})

sequelize.authenticate()
    .then(() => {
        console.log('databse connect success')
    })
    .catch(error => {
        console.log('error ' + error)
    })

const db = {}
db.Sequelize = Sequelize
db.sequelize = sequelize

db.sequelize.sync({ force: false })
    .then(() => {
        console.log('sync databse')
    })
    .catch(e => {
        console.log(e)
    })


// db.user=require('../model/user')(sequelize,DataTypes)
// db.otp=require('../model/otp')(sequelize,DataTypes)
// db.card=require('../model/card')(sequelize,DataTypes)
// db.category=require('../model/category')(sequelize,DataTypes)
// db.country=require('../model/country')(sequelize,DataTypes)
// db.clientCustomer=require('../model/clientCustomer')(sequelize,DataTypes)
// db.note=require('../model/note')(sequelize,DataTypes)
// db.businessEmail=require('../model/businessEmail')(sequelize,DataTypes)

db.businessOwner=require("../model/businessOwner")(sequelize,DataTypes)
db.client=require("../model/client")(sequelize,DataTypes)
db.invoice=require("../model/invoice")(sequelize,DataTypes)
db.invoiceItem=require("../model/invoiceItem")(sequelize,DataTypes)
db.productCategory=require("../model/productCategory")(sequelize,DataTypes)
db.product=require("../model/product")(sequelize,DataTypes)
db.shop=require("../model/shop")(sequelize,DataTypes)
db.productImage=require("../model/product_image")(sequelize,DataTypes)




// relation



// business_owner --shop 
db.businessOwner.hasMany(db.shop, { foreignKey: 'business_owner_id', onDelete: 'CASCADE' });
db.shop.belongsTo(db.businessOwner, { foreignKey: 'business_owner_id' });

// business_owner --shop 
db.businessOwner.hasMany(db.client, { foreignKey: 'business_owner_id', onDelete: 'CASCADE' });
db.client.belongsTo(db.businessOwner, { foreignKey: 'business_owner_id' });



// business_owner - Invoice
db.businessOwner.hasMany(db.invoice, { foreignKey: 'business_owner_id', onDelete: 'CASCADE' });
db.invoice.belongsTo(db.businessOwner, { foreignKey: 'business_owner_id' });

// Client - Invoice
db.client.hasMany(db.invoice, { foreignKey: 'client_id', onDelete: 'SET NULL' });
db.invoice.belongsTo(db.client, { foreignKey: 'client_id' });

// Invoice - InvoiceItem
db.invoice.hasMany(db.invoiceItem, { foreignKey: 'invoice_id', onDelete: 'CASCADE' });
db.invoiceItem.belongsTo(db.invoice, { foreignKey: 'invoice_id' });

// product -- product category
db.productCategory.hasMany(db.product,{foreignKey:'product_category_id',onDelete:'CASCADE'})
db.product.belongsTo(db.productCategory,{foreignKey:'product_category_id'})


// product -- product image
db.product.hasMany(db.productImage,{foreignKey:'product_id',onDelete:'CASCADE'})
db.productImage.belongsTo(db.product,{foreignKey:'product_id'})


// business_owner to product
db.businessOwner.hasMany(db.product,{foreignKey:'business_owner_id',onDelete:'CASCADE'})
db.product.belongsTo(db.businessOwner,{foreignKey:'business_owner_id'})




// relationd

module.exports = db