'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PaymentMethod extends Model {
    static associate(models) {
      PaymentMethod.belongsTo(models.Profile, { foreignKey: 'profileId', as: 'profile' });
      PaymentMethod.hasMany(models.Expenditure, { foreignKey: 'paymentMethodId', as: 'expenditures' });
    }
  }

  PaymentMethod.init({
    profileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'profile_id'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'PaymentMethod',
    tableName: 'payment_methods',
    timestamps: false
  });

  return PaymentMethod;
};