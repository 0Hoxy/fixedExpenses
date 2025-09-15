'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('categories', [
      {
        id: 'housing',
        name: '주거비',
        icon: '🏠',
        color: '#FF6B6B',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'utilities',
        name: '통신비',
        icon: '📱',
        color: '#4ECDC4',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'insurance',
        name: '보험',
        icon: '🛡️',
        color: '#45B7D1',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'transportation',
        name: '교통비',
        icon: '🚗',
        color: '#96CEB4',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'food',
        name: '식비',
        icon: '🍽️',
        color: '#FFEAA7',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'healthcare',
        name: '의료비',
        icon: '🏥',
        color: '#DDA0DD',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'education',
        name: '교육비',
        icon: '📚',
        color: '#98D8C8',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'entertainment',
        name: '엔터테인먼트',
        icon: '🎬',
        color: '#F7DC6F',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'other',
        name: '기타',
        icon: '📦',
        color: '#BB8FCE',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
