module.exports = (sequelize, DataTypes) => {
    const ProductCategory = sequelize.define('product_category', {
        name: {
            type: DataTypes.STRING,
        },
        image:{
            type:DataTypes.STRING
        }
        
    }, {
        timestamps: true
    });
    return ProductCategory;
};
