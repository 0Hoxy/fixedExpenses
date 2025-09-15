'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('expenses', 'is_active', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: '활성 상태 (삭제 시 false)'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('expenses', 'is_active');
  }
};
