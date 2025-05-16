module.exports = (sequelize, DataTypes) => {
    const OTP = sequelize.define('otp', {
        user_id:{
            type: DataTypes.INTEGER
        },
        otp:{
            type:DataTypes.INTEGER
        },
        daily_otp_count:{
            type:DataTypes.INTEGER
        }
    },{
        timestamps:true
    })
    return OTP
}
