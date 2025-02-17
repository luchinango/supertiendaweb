const { Sequelize, DataTypes: ProductDataTypes } = require('sequelize');
const productSequelize = require('../config/database');

const Product = productSequelize.define('Product', {
    producto_id: { type: ProductDataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: ProductDataTypes.STRING, allowNull: false },
    descripcion: { type: ProductDataTypes.STRING, allowNull: false },
    precio_compra: { type: ProductDataTypes.FLOAT, allowNull: false },
    precio_venta: { type: ProductDataTypes.FLOAT, allowNull: false },
    sku: { type: ProductDataTypes.STRING, allowNull: false },
    barcode: { type: ProductDataTypes.STRING, allowNull: false },
    category: { type: ProductDataTypes.STRING, allowNull: false },
    subcategory: { type: ProductDataTypes.STRING, allowNull: false },
    brand: { type: ProductDataTypes.STRING, allowNull: false },
    unidad: { type: ProductDataTypes.STRING, allowNull: false },
    minStock: { type: ProductDataTypes.INTEGER, allowNull: false },
    maxStock: { type: ProductDataTypes.INTEGER, allowNull: false },
    actualStock: { type: ProductDataTypes.INTEGER, allowNull: false },
    fechaExpiracion: { type: ProductDataTypes.DATE, allowNull: false },
    imagen: { type: ProductDataTypes.STRING, allowNull: false },
    createdAt: { type: ProductDataTypes.DATE, defaultValue: Sequelize.NOW },
    deletedAt: { type: ProductDataTypes.DATE }
}, {
    tableName: 'productos',
    timestamps: false
});

module.exports = Product;
