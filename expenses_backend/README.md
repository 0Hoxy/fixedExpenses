# 고정비 관리 백엔드 API

Flutter 앱을 위한 Node.js + Express + PostgreSQL + Redis 백엔드 서버입니다.

## 🚀 기술 스택

- **Node.js**: JavaScript 런타임
- **Express.js**: 웹 프레임워크
- **PostgreSQL**: 관계형 데이터베이스
- **Redis**: 인메모리 캐시
- **Winston**: 로깅
- **Morgan**: HTTP 요청 로깅
- **Helmet**: 보안 미들웨어
- **express-rate-limit**: Rate limiting

## 📋 사전 요구사항

### 1. PostgreSQL 설치 및 실행

```bash
# macOS (Homebrew)
brew install postgresql
brew services start postgresql

# 데이터베이스 생성
createdb expenses_db
```

### 2. Redis 설치 및 실행

```bash
# macOS (Homebrew)
brew install redis
brew services start redis

# 또는 Docker 사용
docker run -d -p 6379:6379 redis:alpine
```

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 설정

`config.env` 파일을 수정하여 데이터베이스 설정을 맞춰주세요:

```env
# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expenses_db
DB_USER=postgres
DB_PASSWORD=your_password

# Redis 설정
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. 서버 초기화

```bash
npm run init
```

### 4. 개발 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

## 📚 API 엔드포인트

### 헬스 체크

- `GET /health` - 서버 상태 확인

### 고정비 관리

- `GET /api/expenses` - 모든 고정비 조회
- `GET /api/expenses/:id` - 특정 고정비 조회
- `POST /api/expenses` - 새 고정비 생성
- `PUT /api/expenses/:id` - 고정비 수정
- `DELETE /api/expenses/:id` - 고정비 삭제
- `GET /api/expenses/stats/total` - 총 고정비 합계
- `GET /api/expenses/stats/categories` - 카테고리별 통계

### 카테고리 관리

- `GET /api/categories` - 모든 카테고리 조회
- `GET /api/categories/:id` - 특정 카테고리 조회
- `POST /api/categories` - 새 카테고리 생성
- `PUT /api/categories/:id` - 카테고리 수정
- `DELETE /api/categories/:id` - 카테고리 삭제

## 📝 API 사용 예시

### 고정비 생성

```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "월세",
    "amount": 500000,
    "category_id": "housing",
    "description": "아파트 월세"
  }'
```

### 고정비 조회

```bash
curl http://localhost:3000/api/expenses
```

### 카테고리 조회

```bash
curl http://localhost:3000/api/categories
```

## 🗄️ 데이터베이스 스키마

### categories 테이블

```sql
CREATE TABLE categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  color VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### expenses 테이블

```sql
CREATE TABLE expenses (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  amount INTEGER NOT NULL,
  category_id VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

## 🔧 개발 도구

### 로그 확인

- `error.log`: 에러 로그
- `combined.log`: 전체 로그
- 콘솔: 실시간 로그

### 캐시 관리

- Redis를 사용한 자동 캐싱
- 고정비 목록: 5분 캐시
- 카테고리 목록: 10분 캐시

### Rate Limiting

- 15분당 최대 100 요청
- IP별 제한

## 🚀 프로덕션 배포

### Docker 사용

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### 환경 변수

프로덕션에서는 다음 환경 변수를 설정하세요:

- `NODE_ENV=production`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `JWT_SECRET`

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. PostgreSQL과 Redis가 실행 중인지
2. 데이터베이스 연결 설정이 올바른지
3. 포트 3000이 사용 가능한지
4. 로그 파일에서 에러 메시지 확인
