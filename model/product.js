module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('product', {
        business_owner_id:{
            type:DataTypes.INTEGER
        },
        product_category_id:{
            type:DataTypes.INTEGER
        },
        name: {
            type: DataTypes.STRING,
        },
        unit_price: {
            type: DataTypes.FLOAT,
        },
        unit_of_measure: {
            type: DataTypes.STRING,
        },
    }, {
        timestamps: true
    });
    return Product;
};
