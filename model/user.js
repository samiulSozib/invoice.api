module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        phone_number:{
            type:DataTypes.CHAR(15),
        },
        password:{
            type:DataTypes.STRING
        },
        date_of_birth:{
            type:DataTypes.DATE
        }
    },{
        timestamps:true
    })
    return User
}
