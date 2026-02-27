// models/TransactionLog.js
module.exports = (sequelize, DataTypes) => {
  const TransactionLog = sequelize.define(
    "transaction_log",
    {
      business_owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      invoice_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING, // 'invoice_created', 'payment'
        allowNull: false,
      },
      total: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      sub_total: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      due_before: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      payment_amount: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      due_after: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      payment_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    { timestamps: true }
  );

  return TransactionLog;
};