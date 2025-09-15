'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PaymentHistory extends Model {
    static associate(models) {
      PaymentHistory.belongsTo(models.Expenditure, {
        foreignKey: 'expenditureId',
        as: 'expenditure'
      });
    }
  }

  PaymentHistory.init({
    expenditureId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'expenditure_id'
    },
    paymentMonth: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'payment_month'
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_paid'
    },
    paidTimestamp: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'paid_timestamp'
    }
  }, {
    sequelize,
    modelName: 'PaymentHistory',
    tableName: 'payment_history',
    timestamps: false
  });

  return PaymentHistory;
};