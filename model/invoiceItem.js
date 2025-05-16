module.exports = (sequelize, DataTypes) => {
    const InvoiceItem = sequelize.define('invoice_item', {
        invoice_id: {
            type: DataTypes.INTEGER
        },
        product_name: {
            type: DataTypes.TEXT
        },
        product_price: {
            type: DataTypes.FLOAT
        },
        quantity: {
            type: DataTypes.INTEGER
        },
        unit_of_measure: {
            type: DataTypes.STRING
        },
        discount: {
            type: DataTypes.FLOAT
        },
        discount_type: {
            type: DataTypes.STRING 
        },
        vat: {
            type: DataTypes.FLOAT
        },
        total: {
            type: DataTypes.FLOAT
        }
    }, {
        timestamps: true
    });

    return InvoiceItem;
};
