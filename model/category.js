module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('category', {
        category_name:{
            type: DataTypes.TEXT
        }
    },{
        timestamps:true
    })
    return Category
}
