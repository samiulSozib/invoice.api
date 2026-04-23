module.exports = (sequelize, DataTypes) => {

  const TopUpTransaction = sequelize.define("topUpTransaction", {

    business_owner_id:{
      type:DataTypes.INTEGER,
      allowNull:false
    },

    supplier_id:DataTypes.INTEGER,

    reseller_id:DataTypes.INTEGER,

    transaction_type:{
      type:DataTypes.ENUM(
        "purchase",
        "sale",
        "supplier_payment",
        "reseller_payment"
      )
    },

    base_amount:{
      type:DataTypes.FLOAT,
      defaultValue:0
    },

    bonus_percentage:{
      type:DataTypes.FLOAT,
      defaultValue:0
    },

    topup_amount:{
      type:DataTypes.FLOAT,
      defaultValue:0
    },

    debit:{
      type:DataTypes.FLOAT,
      defaultValue:0
    },

    credit:{
      type:DataTypes.FLOAT,
      defaultValue:0
    },

    reference_no:DataTypes.STRING,

    notes:DataTypes.TEXT,

    transaction_date:{
      type:DataTypes.DATE,
      defaultValue:DataTypes.NOW
    }

  },{
    timestamps:true,

    indexes:[

      {fields:["business_owner_id"]},

      {fields:["supplier_id"]},

      {fields:["reseller_id"]},

      {fields:["transaction_type"]},

      {fields:["transaction_date"]},

      {fields:["business_owner_id","supplier_id"]},

      {fields:["business_owner_id","reseller_id"]},

      {fields:["business_owner_id","transaction_type"]}

    ]

  });

  return TopUpTransaction;

};