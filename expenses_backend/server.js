const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
require('dotenv').config({ path: './config.env' });
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const app = express();

// 데이터베이스 연결 테스트
const { sequelize } = require('./models');

// 보안 미들웨어
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS 설정
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3001', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100 요청
  message: {
    success: false,
    error: { code: 'RATE_LIMIT_EXCEEDED', message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 인증 관련 엔드포인트에 대한 더 엄격한 Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5 요청
  message: {
    success: false,
    error: { code: 'AUTH_RATE_LIMIT_EXCEEDED', message: '인증 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.' }
  }
});

app.use('/api/', limiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// 기본 미들웨어
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API 문서화 (Swagger)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Fixed Expenses API Documentation'
}));

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API v1 라우트
const apiV1 = express.Router();
app.use('/api/v1', apiV1);

// v1 서브 라우트 로드
const { authenticateToken } = require('./middleware/auth');

// 인증이 필요하지 않은 라우트 (화이트리스트)
apiV1.use('/', require('./routes/v1/auth'));

// 이후 모든 v1 라우트 보호
apiV1.use(authenticateToken);

// 보호된 v1 서브 라우트
apiV1.use('/', require('./routes/v1/categories'));
apiV1.use('/', require('./routes/v1/expenditures'));
apiV1.use('/', require('./routes/v1/dashboard'));
apiV1.use('/', require('./routes/v1/reports'));
apiV1.use('/', require('./routes/v1/backups'));

const PORT = process.env.PORT || 3000;

// 데이터베이스 연결 및 서버 시작
async function startServer() {
  try {
    // 데이터베이스 연결 테스트
    await sequelize.authenticate();
    console.log('✅ 데이터베이스 연결 성공');

    // 테이블 동기화 (개발 환경에서만)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✅ 데이터베이스 테이블 동기화 완료');
    }

    // 서버 시작
    app.listen(PORT, () => {
      console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다`);
    });

  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error);
    process.exit(1);
  }
}

startServer();

// 404 및 글로벌 에러 핸들러 연결 (라우트 선언 이후)
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;