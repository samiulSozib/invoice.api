module.exports = (sequelize, DataTypes) => {
    const ClientCustomer = sequelize.define('client_customer', {
        user_id:{
            type:DataTypes.INTEGER,
        },
        name:{
            type: DataTypes.TEXT
        },
        phone_number:{
            type:DataTypes.CHAR(15),
        }, 
        business_details:{
            type:DataTypes.TEXT
        }
        
    },{
        timestamps:true
    })
    return ClientCustomer
}
