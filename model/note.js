module.exports = (sequelize, DataTypes) => {
    const Note = sequelize.define('note', {
        user_id:{
            type:DataTypes.INTEGER,
        },
        title:{
            type: DataTypes.TEXT
        },
        details:{
            type:DataTypes.TEXT,
        },
        
    },{
        timestamps:true
    })
    return Note
}
