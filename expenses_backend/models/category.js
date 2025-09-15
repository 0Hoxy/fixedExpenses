'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.belongsTo(models.Profile, { foreignKey: 'profileId', as: 'profile' });
      Category.hasMany(models.Expenditure, { foreignKey: 'categoryId', as: 'expenditures' });
    }
  }

  Category.init({
    profileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'profile_id'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_default'
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: false
  });

  return Category;
};