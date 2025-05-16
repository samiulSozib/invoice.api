module.exports = (sequelize, DataTypes) => {
    const Invoice = sequelize.define('invoice', {
        business_owner_id: {
            type: DataTypes.INTEGER
        },
        client_id: {
            type: DataTypes.INTEGER
        },
        shop_id:{
            type:DataTypes.INTEGER
        },
        tax: {
            type: DataTypes.FLOAT
        },
        discount: {
            type: DataTypes.FLOAT
        },
        sub_total: {
            type: DataTypes.FLOAT
        },
        due: {
            type: DataTypes.FLOAT
        },
        total: {
            type: DataTypes.FLOAT
        },
        status: {
            type: DataTypes.STRING
        },
        date:{
            type:DataTypes.DATE
        },
        shipping_cost:{
            type:DataTypes.FLOAT
        },
        over_due:{
            type:DataTypes.FLOAT
        },
        payable_date:{
            type:DataTypes.DATE
        }
    }, {
        timestamps: true
    });

    return Invoice;
};
