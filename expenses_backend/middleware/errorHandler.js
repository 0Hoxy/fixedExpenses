const { ValidationError } = require('sequelize');

// 커스텀 에러 클래스
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Sequelize 에러 처리
const handleSequelizeError = (err) => {
  if (err instanceof ValidationError) {
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));

    return new AppError('데이터 유효성 검사 실패', 400, 'VALIDATION_ERROR');
  }

  // 외래키 제약조건 위반
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return new AppError('참조 무결성 제약조건 위반', 400, 'FOREIGN_KEY_ERROR');
  }

  // 고유 제약조건 위반
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return new AppError(`이미 존재하는 ${field}입니다`, 409, 'DUPLICATE_ERROR');
  }

  // 데이터베이스 연결 에러
  if (err.name === 'SequelizeConnectionError') {
    return new AppError('데이터베이스 연결 실패', 503, 'DATABASE_CONNECTION_ERROR');
  }

  // 기본 데이터베이스 에러
  return new AppError('데이터베이스 오류가 발생했습니다', 500, 'DATABASE_ERROR');
};

// JWT 에러 처리
const handleJWTError = (err) => {
  if (err.name === 'JsonWebTokenError') {
    return new AppError('유효하지 않은 토큰입니다', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    return new AppError('토큰이 만료되었습니다', 401, 'TOKEN_EXPIRED');
  }

  return new AppError('인증 오류가 발생했습니다', 401, 'AUTH_ERROR');
};

// 개발 환경 에러 응답
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message,
      stack: err.stack,
      details: err.details || null
    }
  });
};

// 프로덕션 환경 에러 응답
const sendErrorProd = (err, res) => {
  // 운영상 에러인 경우 클라이언트에게 에러 정보 전송
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message
      }
    });
  }
  // 프로그래밍 에러인 경우 일반적인 메시지만 전송
  else {
    console.error('❌ Programming Error:', err);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '서버 내부 오류가 발생했습니다'
      }
    });
  }
};

// 메인 에러 처리 미들웨어
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // 요청 정보 로깅
  console.error(`❌ Error in ${req.method} ${req.path}:`, {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user?.id || 'anonymous'
  });

  let error = { ...err };
  error.message = err.message;

  // 특정 에러 타입 처리
  if (err.name && err.name.startsWith('Sequelize')) {
    error = handleSequelizeError(err);
  }

  if (err.name && (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError')) {
    error = handleJWTError(err);
  }

  // 환경에 따른 에러 응답
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// 404 에러 처리 미들웨어
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`${req.originalUrl} 경로를 찾을 수 없습니다`, 404, 'NOT_FOUND');
  next(error);
};

// 비동기 에러 캐치 헬퍼
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  AppError,
  globalErrorHandler,
  notFoundHandler,
  catchAsync
};