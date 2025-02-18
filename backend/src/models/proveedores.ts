const { Sequelize: ProveedorSequelize, DataTypes: ProveedorDataTypes } = require('sequelize');
const proveedorSequelize = require('../config/database');

const Proveedor = proveedorSequelize.define('Proveedor', {
    id: { type: ProveedorDataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    razonSocial: { type: ProveedorDataTypes.STRING, allowNull: false, unique: true },
    rif: { type: ProveedorDataTypes.STRING, allowNull: false, unique: true },
    direccion: { type: ProveedorDataTypes.STRING, allowNull: false },
    telefono: { type: ProveedorDataTypes.STRING, allowNull: false },
    email: { type: ProveedorDataTypes.STRING, allowNull: false },
    contacto: { type: ProveedorDataTypes.STRING, allowNull: false },
    tipoProveedor: { type: ProveedorDataTypes.STRING, allowNull: false },
    estado: { type: ProveedorDataTypes.STRING, allowNull: false },
    createdAt: { type: ProveedorDataTypes.DATE, defaultValue: ProveedorSequelize.NOW },
    updatedAt: { type: ProveedorDataTypes.DATE, defaultValue: ProveedorSequelize.NOW }
}, {
    tableName: 'proveedores',
    timestamps: true
});

module.exports = Proveedor;
