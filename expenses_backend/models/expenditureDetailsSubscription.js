'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ExpenditureDetailsSubscription extends Model {
    static associate(models) {
      ExpenditureDetailsSubscription.belongsTo(models.Expenditure, {
        foreignKey: 'expenditureId',
        as: 'expenditure',
        primaryKey: true
      });
    }
  }

  ExpenditureDetailsSubscription.init({
    expenditureId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'expenditure_id'
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    planName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'plan_name'
    },
    reminderDaysBefore: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0,
      field: 'reminder_days_before'
    }
  }, {
    sequelize,
    modelName: 'ExpenditureDetailsSubscription',
    tableName: 'expenditure_details_subscription',
    timestamps: false
  });

  return ExpenditureDetailsSubscription;
};