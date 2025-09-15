'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Photo extends Model {
    static associate(models) {
      Photo.belongsTo(models.Expenditure, {
        foreignKey: 'expenditureId',
        as: 'expenditure'
      });
    }
  }

  Photo.init({
    expenditureId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'expenditure_id'
    },
    filePath: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'file_path'
    }
  }, {
    sequelize,
    modelName: 'Photo',
    tableName: 'photos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return Photo;
};