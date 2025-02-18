const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserModel = sequelize.define('User', {
    id: {  type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, },
  nombre: { type: DataTypes.STRING, allowNull: false, },
  apellido: { type: DataTypes.STRING, allowNull: false, },
  direccion: { type: DataTypes.STRING, false: true, allowNull: false, },
  tel_cel: { type: DataTypes.STRING, false: true, allowNull: false, },
  email: { type: DataTypes.STRING, false: true, allowNull: false, },
  puesto: { type: DataTypes.STRING, false: true, allowNull: false,  },
}, {
  timestamps: true, // Crea createdAt y updatedAt automáticamente
});

module.exports = UserModel;