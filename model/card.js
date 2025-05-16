module.exports = (sequelize, DataTypes) => {
    const Card = sequelize.define('card', {
        user_id:{
            type:DataTypes.INTEGER,
        },
        category_id:{
            type:DataTypes.INTEGER
        },
        category_name:{
            type:DataTypes.CHAR(60)
        },
        full_name:{
            type: DataTypes.TEXT
        },
        phone_number:{
            type:DataTypes.CHAR(15),
        },
        email:{
            type:DataTypes.TEXT
        },
        company_name:{
            type:DataTypes.TEXT
        },
        designation:{
            type:DataTypes.TEXT
        },
        address:{
            type:DataTypes.TEXT,
        },
        website:{
            type:DataTypes.TEXT,
        },
        facebook:{
            type:DataTypes.TEXT,
        },
        twitter:{
            type:DataTypes.TEXT,
        },
        instagram:{
            type:DataTypes.TEXT,
        },
        linkedin:{
            type:DataTypes.TEXT,
        },
        card_image1:{
            type:DataTypes.TEXT
        },
        card_image2:{
            type:DataTypes.TEXT
        }
        
    },{
        timestamps:true
    })
    return Card
}
