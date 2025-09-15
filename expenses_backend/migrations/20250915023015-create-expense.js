'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('expenses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: '고정비 고유 ID'
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: '고정비 이름'
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '고정비 금액 (원)'
      },
      category_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: '카테고리 ID (외래키)'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '고정비 설명'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: '활성 상태 (삭제 시 false)'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // 인덱스 생성
    await queryInterface.addIndex('expenses', ['category_id']);
    await queryInterface.addIndex('expenses', ['is_active']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('expenses');
  }
};