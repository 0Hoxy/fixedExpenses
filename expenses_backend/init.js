require('dotenv').config({ path: './config.env' });
const { testConnection, createTables } = require('./config/database');

const initializeServer = async () => {
  console.log('🚀 서버 초기화 시작...');

  try {
    // 데이터베이스 연결 테스트
    await testConnection();

    // 테이블 생성 및 기본 데이터 삽입
    await createTables();

    console.log('✅ 서버 초기화 완료!');
    console.log('📝 다음 단계:');
    console.log('   1. PostgreSQL과 Redis가 실행 중인지 확인');
    console.log('   2. npm run dev 명령으로 서버 시작');
    console.log('   3. http://localhost:3000/health 에서 서버 상태 확인');

  } catch (error) {
    console.error('❌ 서버 초기화 실패:', error.message);
    console.log('\n🔧 문제 해결 방법:');
    console.log('   1. PostgreSQL이 설치되어 있고 실행 중인지 확인');
    console.log('   2. Redis가 설치되어 있고 실행 중인지 확인');
    console.log('   3. config.env 파일의 데이터베이스 설정 확인');
    process.exit(1);
  }
};

// 서버 초기화 실행
initializeServer();
