'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ExpenditureDetailsInstallment extends Model {
    static associate(models) {
      ExpenditureDetailsInstallment.belongsTo(models.Expenditure, {
        foreignKey: 'expenditureId',
        as: 'expenditure',
        primaryKey: true
      });
    }
  }

  ExpenditureDetailsInstallment.init({
    expenditureId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'expenditure_id'
    },
    principalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'principal_amount'
    },
    monthlyPayment: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'monthly_payment'
    },
    startMonth: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_month'
    },
    totalMonths: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: {
        min: 1
      },
      field: 'total_months'
    },
    interestType: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'none',
      validate: {
        isIn: [['none', 'percent', 'fixed']]
      },
      field: 'interest_type'
    },
    interestValue: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      field: 'interest_value'
    }
  }, {
    sequelize,
    modelName: 'ExpenditureDetailsInstallment',
    tableName: 'expenditure_details_installment',
    timestamps: false
  });

  return ExpenditureDetailsInstallment;
};