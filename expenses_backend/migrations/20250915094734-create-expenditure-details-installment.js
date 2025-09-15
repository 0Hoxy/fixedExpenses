'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ExpenditureDetailsInstallments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      expenditureId: {
        type: Sequelize.STRING
      },
      principalAmount: {
        type: Sequelize.DECIMAL
      },
      monthlyPayment: {
        type: Sequelize.DECIMAL
      },
      startMonth: {
        type: Sequelize.DATE
      },
      totalMonths: {
        type: Sequelize.INTEGER
      },
      interestType: {
        type: Sequelize.STRING
      },
      interestValue: {
        type: Sequelize.DECIMAL
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ExpenditureDetailsInstallments');
  }
};