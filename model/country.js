module.exports = (sequelize, DataTypes) => {
    const Country = sequelize.define('country', {
        shortname: {
            type: DataTypes.CHAR(3)	
        },
        name:{
            type: DataTypes.CHAR(150)	
        },
        phonecode:{
            type: DataTypes.INTEGER
        }
    })
    return Country
}