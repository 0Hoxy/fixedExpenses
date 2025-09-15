const { Pool } = require('pg');
const redis = require('redis');

// PostgreSQL 연결 풀
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'expenses_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis 클라이언트
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

// Redis 연결 이벤트
redisClient.on('connect', () => {
  console.log('✅ Redis 연결 성공');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis 연결 오류:', err);
});

// Redis 연결
redisClient.connect().catch(console.error);

// 데이터베이스 연결 테스트
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL 연결 성공');
    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL 연결 오류:', err);
  }
};

// 테이블 생성
const createTables = async () => {
  try {
    const client = await pool.connect();

    // 카테고리 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(10) NOT NULL,
        color VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 고정비 테이블
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        amount INTEGER NOT NULL,
        category_id VARCHAR(50) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    // 기본 카테고리 데이터 삽입
    const categories = [
      { id: 'housing', name: '주거비', icon: '🏠', color: '#FF6B6B' },
      { id: 'utilities', name: '통신비', icon: '📱', color: '#4ECDC4' },
      { id: 'insurance', name: '보험', icon: '🛡️', color: '#45B7D1' },
      { id: 'transportation', name: '교통비', icon: '🚗', color: '#96CEB4' },
      { id: 'food', name: '식비', icon: '🍽️', color: '#FFEAA7' },
      { id: 'healthcare', name: '의료비', icon: '🏥', color: '#DDA0DD' },
      { id: 'education', name: '교육비', icon: '📚', color: '#98D8C8' },
      { id: 'entertainment', name: '엔터테인먼트', icon: '🎬', color: '#F7DC6F' },
      { id: 'other', name: '기타', icon: '📦', color: '#BB8FCE' }
    ];

    for (const category of categories) {
      await client.query(`
        INSERT INTO categories (id, name, icon, color) 
        VALUES ($1, $2, $3, $4) 
        ON CONFLICT (id) DO NOTHING
      `, [category.id, category.name, category.icon, category.color]);
    }

    console.log('✅ 테이블 생성 및 기본 데이터 삽입 완료');
    client.release();
  } catch (err) {
    console.error('❌ 테이블 생성 오류:', err);
  }
};

module.exports = {
  pool,
  redisClient,
  testConnection,
  createTables
};
