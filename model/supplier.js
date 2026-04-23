module.exports = (sequelize, DataTypes) => {

  const Supplier = sequelize.define("supplier", {

    business_owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    name: DataTypes.STRING,

    phone: DataTypes.STRING,

    company: DataTypes.STRING,

    bonus_percentage: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },

    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }

  },{
    timestamps:true,

    indexes:[
      { fields:["business_owner_id"] },
      { fields:["business_owner_id","name"] }
    ]
  });

  return Supplier;
};