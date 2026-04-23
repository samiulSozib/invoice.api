module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define('admin', {
        username:{
            type:DataTypes.CHAR(15),
        },
        password:{
            type:DataTypes.STRING
        },
        
    },{
        timestamps:true
    })
    return Admin
}
