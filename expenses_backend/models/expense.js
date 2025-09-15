'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Expenditure extends Model {
    static associate(models) {
      Expenditure.belongsTo(models.Profile, { foreignKey: 'profileId', as: 'profile' });
      Expenditure.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
      Expenditure.belongsTo(models.PaymentMethod, { foreignKey: 'paymentMethodId', as: 'paymentMethod' });

      Expenditure.hasOne(models.ExpenditureDetailsRegular, { foreignKey: 'expenditureId', as: 'regularDetail' });
      Expenditure.hasOne(models.ExpenditureDetailsSubscription, { foreignKey: 'expenditureId', as: 'subscriptionDetail' });
      Expenditure.hasOne(models.ExpenditureDetailsInstallment, { foreignKey: 'expenditureId', as: 'installmentDetail' });

      Expenditure.hasMany(models.PaymentHistory, { foreignKey: 'expenditureId', as: 'paymentHistory' });
      Expenditure.hasMany(models.StatusHistory, { foreignKey: 'expenditureId', as: 'statusHistory' });
      Expenditure.hasMany(models.Photo, { foreignKey: 'expenditureId', as: 'photos' });
    }
  }

  Expenditure.init({
    profileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'profile_id'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'category_id'
    },
    paymentMethodId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'payment_method_id'
    },
    itemName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'item_name'
    },
    paymentDay: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: {
        min: 1,
        max: 31
      },
      field: 'payment_day'
    },
    paymentCycle: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'payment_cycle'
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['REGULAR', 'SUBSCRIPTION', 'INSTALLMENT']]
      }
    },
    memo: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Expenditure',
    tableName: 'expenditures',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Expenditure;
};