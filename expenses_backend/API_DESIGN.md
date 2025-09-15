# 고정비 관리 앱 - 백엔드 API 설계

## 📋 **프로젝트 개요**

- **목적**: 월별 고정 지출을 관리하는 웹/모바일 앱
- **기술 스택**: Node.js + Express + PostgreSQL + Redis
- **API 스타일**: RESTful API

## 🗄️ **데이터베이스 설계**

### **1. Categories (카테고리) 테이블**

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

### **2. Expenses (고정비) 테이블**

```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  amount INTEGER NOT NULL,
  category_id VARCHAR(50) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

## 🔌 **API 엔드포인트 설계**

### **Base URL**: `http://localhost:3000/api`

---

## 📂 **1. 카테고리 API**

### **GET /api/categories**

- **설명**: 모든 카테고리 목록 조회
- **응답**:

```json
{
  "success": true,
  "data": [
    {
      "id": "housing",
      "name": "주거비",
      "icon": "🏠",
      "color": "#FF6B6B"
    }
  ],
  "count": 9
}
```

---

## 💰 **2. 고정비 API**

### **GET /api/expenses**

- **설명**: 모든 고정비 목록 조회
- **쿼리 파라미터**:
  - `category_id` (선택): 특정 카테고리만 필터링
  - `is_active` (선택): 활성/비활성 필터링 (기본값: true)
- **응답**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "name": "월세",
      "amount": 500000,
      "category_id": "housing",
      "category_name": "주거비",
      "category_icon": "🏠",
      "category_color": "#FF6B6B",
      "description": "월세 및 관리비",
      "is_active": true,
      "created_at": "2025-09-15T02:00:00.000Z",
      "updated_at": "2025-09-15T02:00:00.000Z"
    }
  ],
  "count": 1,
  "total_amount": 500000
}
```

### **POST /api/expenses**

- **설명**: 새로운 고정비 추가
- **요청 본문**:

```json
{
  "name": "월세",
  "amount": 500000,
  "category_id": "housing",
  "description": "월세 및 관리비"
}
```

- **응답**:

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "name": "월세",
    "amount": 500000,
    "category_id": "housing",
    "category_name": "주거비",
    "category_icon": "🏠",
    "category_color": "#FF6B6B",
    "description": "월세 및 관리비",
    "is_active": true,
    "created_at": "2025-09-15T02:00:00.000Z",
    "updated_at": "2025-09-15T02:00:00.000Z"
  }
}
```

### **GET /api/expenses/:id**

- **설명**: 특정 고정비 상세 조회
- **응답**: 위와 동일한 단일 객체

### **PUT /api/expenses/:id**

- **설명**: 고정비 수정
- **요청 본문** (부분 업데이트 가능):

```json
{
  "name": "수정된 월세",
  "amount": 550000,
  "description": "월세 인상"
}
```

### **DELETE /api/expenses/:id**

- **설명**: 고정비 삭제 (실제로는 is_active = false로 변경)
- **응답**:

```json
{
  "success": true,
  "message": "고정비가 삭제되었습니다"
}
```

---

## 📊 **3. 통계 API**

### **GET /api/expenses/summary**

- **설명**: 고정비 요약 통계
- **응답**:

```json
{
  "success": true,
  "data": {
    "total_amount": 1500000,
    "active_count": 5,
    "category_summary": [
      {
        "category_id": "housing",
        "category_name": "주거비",
        "amount": 500000,
        "count": 1
      }
    ]
  }
}
```

---

## 🔒 **에러 처리**

### **표준 에러 응답 형식**:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다",
    "details": {
      "amount": "금액은 0보다 커야 합니다"
    }
  }
}
```

### **HTTP 상태 코드**:

- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `404`: 리소스 없음
- `500`: 서버 오류

---

## 🚀 **구현 순서**

1. **기본 서버 설정** ✅
2. **데이터베이스 연결 및 테이블 생성**
3. **카테고리 API 구현**
4. **고정비 CRUD API 구현**
5. **통계 API 구현**
6. **에러 처리 및 검증**
7. **API 테스트**

---

## 📝 **다음 단계**

이제 이 설계를 바탕으로 단계별로 구현해보겠습니다!
