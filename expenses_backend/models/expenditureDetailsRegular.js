'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ExpenditureDetailsRegular extends Model {
    static associate(models) {
      ExpenditureDetailsRegular.belongsTo(models.Expenditure, {
        foreignKey: 'expenditureId',
        as: 'expenditure',
        primaryKey: true
      });
    }
  }

  ExpenditureDetailsRegular.init({
    expenditureId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'expenditure_id'
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    isShared: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_shared'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      field: 'total_amount'
    },
    shareType: {
      type: DataTypes.STRING(10),
      allowNull: true,
      validate: {
        isIn: [['percent', 'fixed']]
      },
      field: 'share_type'
    }
  }, {
    sequelize,
    modelName: 'ExpenditureDetailsRegular',
    tableName: 'expenditure_details_regular',
    timestamps: false
  });

  return ExpenditureDetailsRegular;
};