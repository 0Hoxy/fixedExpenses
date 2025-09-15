'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categories', {
      id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        allowNull: false,
        comment: '카테고리 ID (예: housing, utilities)'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '카테고리 이름'
      },
      icon: {
        type: Sequelize.STRING(10),
        allowNull: false,
        comment: '카테고리 아이콘 (이모지)'
      },
      color: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: '카테고리 색상 (HEX 코드)'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('categories');
  }
};