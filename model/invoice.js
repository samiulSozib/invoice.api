module.exports = (sequelize, DataTypes) => {
    const Invoice = sequelize.define('invoice', {

        // Invoice Info
        invoice_number: {
            type: DataTypes.CHAR(25),
            unique: true
        },

        // Relations
        business_owner_id: {
            type: DataTypes.INTEGER
        },

        client_id: {
            type: DataTypes.INTEGER
        },

        shop_id: {
            type: DataTypes.INTEGER
        },

        // Amounts
        sub_total: {
            type: DataTypes.FLOAT
        },

        tax: {
            type: DataTypes.FLOAT
        },

        discount: {
            type: DataTypes.FLOAT
        },

        shipping_cost: {
            type: DataTypes.FLOAT
        },

        total: {
            type: DataTypes.FLOAT
        },

        due: {
            type: DataTypes.FLOAT
        },


        // Status
        status: {
            type: DataTypes.STRING
        },

        // Dates
        payable_date: {
            type: DataTypes.DATE
        }

    }, {
        timestamps: true
    });

    return Invoice;
};