# API 명세서 (REST API Specification)

- Base URL: `http://localhost:3000/api/v1`
- Content-Type: `application/json; charset=utf-8`
- 인증: (단일 사용자 가정) - 추후 JWT 도입 가능
- 표준 응답 형식:

```json
{
  "success": true,
  "data": {},
  "error": { "code": "", "message": "", "details": {} }
}
```

- 페이지네이션 메타(컬렉션 응답):

```json
{
  "success": true,
  "data": [ ... ],
  "meta": { "page": 1, "pageSize": 20, "total": 123, "hasNext": true }
}
```

---

## 1. 카테고리 (Categories)

### GET /profiles/{profileId}/categories

- 설명: 프로필 스코프의 카테고리 목록 조회
- 200 응답:

```json
{
  "success": true,
  "data": [{ "id": "housing", "name": "주거비", "icon": "🏠", "color": "#FF6B6B" }],
  "count": 9
}
```

---

## 2. 지출 (Expenditures)

### GET /profiles/{profileId}/expenditures

- 설명: 지출 목록 조회 (필터/페이지네이션)
- 쿼리:
  - `categoryId`(선택)
  - `month`(선택, YYYY-MM - 상태 이력 기준 active 필터링)
  - `isActive`(선택, 기본 true)
  - `page`(선택), `pageSize`(선택)
- 200 응답: 컬렉션 + meta

### POST /profiles/{profileId}/expenditures

- 설명: 신규 지출 생성 (ENTRY-001)
- 본문(공통):

```json
{
  "itemName": "월세",
  "type": "REGULAR|SUBSCRIPTION|INSTALLMENT",
  "categoryId": "housing",
  "paymentDay": 10,
  "paymentCycle": "monthly",
  "memo": "옵션",
  "detail": {
    /* 유형별 필수 필드 */
  }
}
```

- 유형별 detail 예시:
  - REGULAR: `{ "amount": 500000, "isShared": false }`
  - SUBSCRIPTION: `{ "amount": 13500, "planName": "Basic", "reminderDaysBefore": 0 }`
  - INSTALLMENT: `{ "principalAmount": 1200000, "monthlyPayment": 100000, "startMonth": "2025-01-01", "totalMonths": 12, "interestType": "none", "interestValue": null }`
- 201 응답: 본문에 생성 리소스, 헤더 `Location: /api/v1/expenditures/{id}`

### GET /expenditures/{id}

- 설명: 지출 상세 조회 (공통 + 유형별 상세 + 최신 상태/납부 정보 포함)
- 200 응답:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "itemName": "아이클라우드",
    "type": "SUBSCRIPTION",
    "category": { "id": "utilities", "name": "통신비", "icon": "📱", "color": "#4ECDC4" },
    "paymentDay": 1,
    "paymentCycle": "monthly",
    "detail": { "amount": 3300, "planName": "50GB" },
    "status": { "current": "active", "effectiveMonth": "2025-09-01" },
    "lastPayment": { "month": "2025-08-01", "isPaid": true, "paidTimestamp": "2025-08-01T12:00:00Z" }
  }
}
```

### PATCH /expenditures/{id}

- 설명: 지출 공통 정보 부분 수정 (유형 변경 불가)
- 본문: 변경할 필드만 포함
- 200 응답: 수정된 리소스

### DELETE /expenditures/{id}

- 설명: 하드 삭제만 수행 (소프트 삭제는 PATCH로 `isActive:false` 처리)
- 204 응답

---

## 3. 서브리소스 (Subresources)

### PUT /expenditures/{id}/payments/{yyyy-mm}

- 설명: 해당 월 납부 상태 UPSERT (ACTION-001 대체, 멱등)
- 본문:

```json
{ "isPaid": true, "paidTimestamp": "2025-09-01T09:00:00Z" }
```

- 200 응답: `{ success: true }`

### PUT /expenditures/{id}/statuses/{yyyy-mm-01}

- 설명: 해당 월 상태 이력 UPSERT (ACTION-002 대체, 멱등)
- 본문:

```json
{ "status": "active|paused" }
```

- 200 응답: `{ success: true }`

---

## 4. 대시보드/리포트 (Dashboard & Reports)

### GET /profiles/{profileId}/dashboard

- 설명: DASH-001 월별 요약 정보
- 쿼리: `month=YYYY-MM`
- 200 응답:

```json
{
  "success": true,
  "data": {
    "monthTotal": 1500000,
    "lastMonthTotal": 1380000,
    "deltaMessage": "+120,000원 증가",
    "upcoming": { "expenditureId": "uuid", "itemName": "넷플릭스", "dueDate": "2025-09-15", "amount": 13500 },
    "byCategory": [{ "categoryId": "housing", "name": "주거비", "amount": 500000, "ratio": 0.33 }]
  }
}
```

### GET /profiles/{profileId}/reports/monthly

- 설명: REPORT-001 기간별 리포트 (월별 추이 + 카테고리별 합계)
- 쿼리: `from=YYYY-MM`, `to=YYYY-MM`
- 200 응답:

```json
{
  "success": true,
  "data": {
    "series": [
      { "month": "2025-06", "total": 1400000 },
      { "month": "2025-07", "total": 1420000 }
    ],
    "byCategory": [{ "categoryId": "food", "name": "식비", "amount": 280000 }]
  }
}
```

---

## 5. 백업/복원 (Data)

### POST /backups

- 설명: 백업 파일 생성(비동기 처리 권장)
- 202 응답: 작업 ID 반환

### GET /backups/{jobId}

- 설명: 백업 진행 상태/결과 조회 (완료 시 파일 다운로드 URL 제공)

### POST /restores

- 설명: 백업 파일로 복원 (multipart/form-data)
- 202 응답: 작업 ID 반환 (서버 비동기 처리, 트랜잭션 적용)

---

## 6. 오류/헤더 규약

- 오류 코드:
  - `VALIDATION_ERROR` (400)
  - `NOT_FOUND` (404)
  - `CONFLICT` (409)
  - `UNPROCESSABLE` (422)
  - `INTERNAL_ERROR` (500)
- 생성 응답 헤더: `Location`
- 페이지네이션: `page`, `pageSize` 쿼리 사용, 응답 `meta` 포함
- JSON 케이스: API는 camelCase, DB는 snake_case 유지

---

## 7. 스코프/규약 (Conventions)

### 7.1 Profiles 스코프 운영

- 초기 MVP에서는 단일 사용자 가정. `profileId`는 서버 기본값(예: 1)로 대체 가능.
- 다중 사용자 도입 시 클라이언트는 `/profiles/{profileId}/...` 경로를 사용.

### 7.2 월 키 포맷 규칙

- 납부(Payments) 서브리소스: `{yyyy-mm}` 사용. 서버 내부에서 `payment_month`는 월 첫날(yyyy-mm-01)로 저장.
- 상태(Statuses) 서브리소스: `{yyyy-mm-01}` 사용. 월 기준 상태 이력의 유니크 키로 활용.
- 서버는 포맷 검증 및 상호 변환을 엄격히 수행하며, 불일치 시 400(VALIDATION_ERROR) 반환.

### 7.3 지출 상세 detail ↔ DB 매핑

| type         | API detail 필드                                                                       | 저장 테이블                      | 주요 컬럼                                                                                   |
| ------------ | ------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------- |
| REGULAR      | amount, isShared                                                                      | expenditure_details_regular      | amount, is_shared, total_amount?, share_type?                                               |
| SUBSCRIPTION | amount, planName, reminderDaysBefore                                                  | expenditure_details_subscription | amount, plan_name, reminder_days_before                                                     |
| INSTALLMENT  | principalAmount, monthlyPayment, startMonth, totalMonths, interestType, interestValue | expenditure_details_installment  | principal_amount, monthly_payment, start_month, total_months, interest_type, interest_value |

### 7.4 컬렉션 응답 기본값

- 쿼리: `page=1`, `pageSize=20`, `isActive=true`
- 응답: 모든 컬렉션 엔드포인트는 `meta` 포함
