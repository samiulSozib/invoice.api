module.exports = (sequelize, DataTypes) => {
    const BusinessEmail = sequelize.define('business_email', {
        user_id:{
            type:DataTypes.INTEGER,
        },
        name:{
            type: DataTypes.TEXT
        },
        email:{
            type:DataTypes.TEXT,
        },
        
    },{
        timestamps:true
    })
    return BusinessEmail
}
