module.exports = (sequelize, DataTypes) => {
    const Client = sequelize.define('client', {
        business_owner_id:{
            type:DataTypes.INTEGER
        },
        name: {
            type: DataTypes.TEXT
        },
        phone_number: {
            type: DataTypes.STRING
        },
        address: {
            type: DataTypes.TEXT
        },
        total_due: {
            type: DataTypes.FLOAT
        },
    }, {
        timestamps: false
    });

    return Client;
};
