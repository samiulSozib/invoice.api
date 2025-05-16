module.exports = (sequelize, DataTypes) => {
    const ProductImage = sequelize.define('product_image', {
       product_id:{
        type:DataTypes.INTEGER
       },
        image_url:{
            type:DataTypes.STRING
        }
    }, {
        timestamps: true
    });
    return ProductImage;
};
