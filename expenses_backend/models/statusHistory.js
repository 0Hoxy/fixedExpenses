'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StatusHistory extends Model {
    static associate(models) {
      StatusHistory.belongsTo(models.Expenditure, {
        foreignKey: 'expenditureId',
        as: 'expenditure'
      });
    }
  }

  StatusHistory.init({
    expenditureId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'expenditure_id'
    },
    status: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: [['active', 'paused']]
      }
    },
    effectiveMonth: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'effective_month'
    }
  }, {
    sequelize,
    modelName: 'StatusHistory',
    tableName: 'status_history',
    timestamps: false
  });

  return StatusHistory;
};