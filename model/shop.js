module.exports = (sequelize, DataTypes) => {
    const Shop = sequelize.define('shop', {
        business_owner_id:{
            type:DataTypes.INTEGER
        },
        name: {
            type: DataTypes.STRING,
        },
        address: {
            type: DataTypes.STRING,
        },
        phone_number_1: {
            type: DataTypes.CHAR(15),
        },
        phone_number_2: {
            type: DataTypes.CHAR(15),
        },
        website: {
            type: DataTypes.STRING,
        },
        logo:{
            type:DataTypes.STRING
        }
    }, {
        timestamps: true
    });
    return Shop;
};
