'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    static associate(models) {
      Profile.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Profile.hasMany(models.Category, { foreignKey: 'profileId', as: 'categories' });
      Profile.hasMany(models.PaymentMethod, { foreignKey: 'profileId', as: 'paymentMethods' });
      Profile.hasMany(models.Expenditure, { foreignKey: 'profileId', as: 'expenditures' });
    }
  }

  Profile.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    currencyCode: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'KRW',
      field: 'currency_code'
    }
  }, {
    sequelize,
    modelName: 'Profile',
    tableName: 'profiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Profile;
};