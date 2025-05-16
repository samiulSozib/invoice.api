module.exports = (sequelize, DataTypes) => {
    const BusinessOwner = sequelize.define('business_owner', {
        name: {
            type: DataTypes.STRING,
        },
        address:{
            type:DataTypes.STRING
        },
        phone_number: {
            type: DataTypes.CHAR(15),
        },
        thumbnail_image: {
            type: DataTypes.STRING,
        },
        currency: {
            type: DataTypes.STRING,
        },
        total_sales_amount: {
            type: DataTypes.FLOAT,
        },
        total_unpaid_amount: {
            type: DataTypes.FLOAT,
        },
        password:{
            type:DataTypes.STRING
        },
        date_of_birth:{
            type:DataTypes.CHAR(15)
        }
    }, {
        timestamps: true
    });
    return BusinessOwner;
};
