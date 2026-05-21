module.exports = (sequelize, DataTypes) => {
    const BusinessOwner = sequelize.define('business_owner', {
        name: {
            type: DataTypes.STRING,
        },
        address: {
            type: DataTypes.STRING
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
            defaultValue: 0
        },
        total_unpaid_amount: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        password: {
            type: DataTypes.STRING
        },
        date_of_birth: {
            type: DataTypes.CHAR(15)
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        is_premium: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        subscription_expiry_date: {
            type: DataTypes.DATE
        },
        type: {
            type: DataTypes.ENUM('business_owner', 'employee', 'guest'),
            defaultValue: 'business_owner'
        }

    }, {
        timestamps: true
    });
    return BusinessOwner;
};
