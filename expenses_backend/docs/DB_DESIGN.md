### **테이블 명세 (Table Specifications)**

#### **1.1. 핵심 엔티티 테이블 (Core Entity Tables)**

**1.1.1. `profiles`** (사용자 프로필) | 컬럼명 | 데이터 타입 | 키/제약조건 | 설명 | | :--- | :--- | :--- | :--- | | `profile_id` | `INTEGER` | `PK, AUTOINCREMENT` | 프로필 고유 ID | | `name` | `VARCHAR(100)` | `NOT NULL` | 프로필 이름 (예: 개인용) | | `currency_code`| `VARCHAR(3)` | `NOT NULL, DEFAULT 'KRW'` | 프로필별 통화 코드 | | `created_at` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | 생성 일시 |

**1.1.2. `categories`** (카테고리) | 컬럼명 | 데이터 타입 | 키/제약조건 | 설명 | | :--- | :--- | :--- | :--- | | `category_id` | `INTEGER` | `PK, AUTOINCREMENT` | 카테고리 고유 ID | | `profile_id` | `INTEGER` | `FK (profiles.profile_id) ON DELETE CASCADE` | 소유 프로필 ID | | `name` | `VARCHAR(100)`| `NOT NULL, UNIQUE(profile_id, name)` | 카테고리 이름 | | `is_default` | `BOOLEAN` | `NOT NULL, DEFAULT FALSE` | 기본 제공 카테고리 여부 | | `icon` | `VARCHAR(100)`| `NULL` | 아이콘 식별자 | | `color` | `VARCHAR(7)` | `NULL` | 색상 헥스 코드 (예: #FF5733) |

**1.1.3. `payment_methods`** (결제 수단) | 컬럼명 | 데이터 타입 | 키/제약조건 | 설명 | | :--- | :--- | :--- | :--- | | `method_id` | `INTEGER` | `PK, AUTOINCREMENT` | 결제 수단 고유 ID | | `profile_id` | `INTEGER` | `FK (profiles.profile_id) ON DELETE CASCADE` | 소유 프로필 ID | | `name` | `VARCHAR(100)`| `NOT NULL, UNIQUE(profile_id, name)` | 결제 수단 이름 (예: 현대카드) | | `type` | `VARCHAR(50)` | `NULL` | 결제 수단 타입 (예: 신용카드) |

#### **1.2. 지출 데이터 테이블 (Expenditure Data Tables)**

**1.2.1. `expenditures`** (모든 지출의 공통 마스터 정보) | 컬럼명 | 데이터 타입 | 키/제약조건 | 설명 | | :--- | :--- | :--- | :--- | | `expenditure_id` | `INTEGER` | `PK, AUTOINCREMENT` | 지출 고유 ID | | `profile_id` | `INTEGER` | `FK (profiles.profile_id) ON DELETE CASCADE` | 소유 프로필 ID | | `category_id`| `INTEGER` | `FK (categories.category_id) ON DELETE RESTRICT` | 소속 카테고리 ID | | `payment_method_id` | `INTEGER` | `FK (payment_methods.method_id) ON DELETE SET NULL`| 연결된 결제 수단 ID | | `item_name` | `VARCHAR(255)`| `NOT NULL` | 항목명 | | `payment_day` | `TINYINT` | `NOT NULL, CHECK(payment_day BETWEEN 1 AND 31)` | 월 결제일 | | `payment_cycle`| `VARCHAR(20)` | `NOT NULL` | 결제 주기 (monthly, yearly 등) | | `type` | `VARCHAR(20)` | `NOT NULL` | 지출 유형 (REGULAR, SUBSCRIPTION, INSTALLMENT) | | `memo` | `TEXT` | `NULL` | 메모 | | `created_at` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | 생성 일시 |

**1.2.2. `expenditure_details_regular`** (일반/공동 지출 상세) | 컬럼명 | 데이터 타입 | 키/제약조건 | 설명 | | :--- | :--- | :--- | :--- | | `expenditure_id` | `INTEGER` | `PK, FK (expenditures.expenditure_id) ON DELETE CASCADE` | 지출 고유 ID | | `amount` | `DECIMAL(12,2)`| `NOT NULL` | **나의 부담액** | | `is_shared` | `BOOLEAN` | `NOT NULL, DEFAULT FALSE` | 공동 지출 여부 | | `total_amount` | `DECIMAL(12,2)`| `NULL` | (공동) 분할 전 총액 | | `share_type` | `VARCHAR(10)` | `NULL` | (공동) 분할 방식 (percent, fixed) |

**1.2.3. `expenditure_details_subscription`** (구독 상세) | 컬럼명 | 데이터 타입 | 키/제약조건 | 설명 | | :--- | :--- | :--- | :--- | | `expenditure_id` | `INTEGER` | `PK, FK (expenditures.expenditure_id) ON DELETE CASCADE` | 지출 고유 ID | | `amount` | `DECIMAL(12,2)`| `NOT NULL` | 구독료 | | `plan_name` | `VARCHAR(100)`| `NULL` | 서비스 플랜 (예: 프리미엄) | | `reminder_days_before`|`TINYINT`| `NOT NULL, DEFAULT 0`| 결제일 사전 알림일 (0: 없음) |

**1.2.4. `expenditure_details_installment`** (할부 상세) | 컬럼명 | 데이터 타입 | 키/제약조건 | 설명 | | :--- | :--- | :--- | :--- | | `expenditure_id` | `INTEGER` | `PK, FK (expenditures.expenditure_id) ON DELETE CASCADE` | 지출 고유 ID | | `principal_amount`| `DECIMAL(12,2)`| `NOT NULL` | 총 할부 원금 | | `monthly_payment` | `DECIMAL(12,2)`| `NOT NULL` | 월 납부액 (원금+이자) | | `start_month` | `DATE` | `NOT NULL` | 할부 시작월 (YYYY-MM-01) | | `total_months` | `TINYINT` | `NOT NULL, CHECK(total_months > 0)` | 총 개월 수 | | `interest_type`| `VARCHAR(10)` | `NOT NULL, DEFAULT 'none'` | 이자 유형 (none, percent, fixed) | | `interest_value`| `DECIMAL(10,4)`| `NULL` | 이자 값 |

#### **1.3. 기록 및 메타데이터 테이블 (History & Metadata Tables)**

**1.3.1. `payment_history`** (월별 납부 기록) | 컬럼명 | 데이터 타입 | 키/제약조건 | 설명 | | :--- | :--- | :--- | :--- | | `history_id` | `INTEGER` | `PK, AUTOINCREMENT` | 기록 고유 ID | | `expenditure_id` | `INTEGER` | `FK (expenditures.expenditure_id) ON DELETE CASCADE` | 지출 고유 ID | | `payment_month`| `DATE` | `NOT NULL` | 납부 대상월 (YYYY-MM-01) | | `is_paid` | `BOOLEAN` | `NOT NULL, DEFAULT FALSE` | 납부 완료 여부 | | `paid_timestamp`| `DATETIME` | `NULL` | 납부 처리 시각 |

**1.3.2. `status_history`** (상태 변경 이력: 일시정지/활성) | 컬럼명 | 데이터 타입 | 키/제약조건 | 설명 | | :--- | :--- | :--- | :--- | | `status_id` | `INTEGER` | `PK, AUTOINCREMENT` | 상태 기록 고유 ID | | `expenditure_id` | `INTEGER` | `FK (expenditures.expenditure_id) ON DELETE CASCADE` | 지출 고유 ID | | `status` | `VARCHAR(10)` | `NOT NULL` | 상태 (active, paused) | | `effective_month`| `DATE` | `NOT NULL` | 상태 적용 시작월 (YYYY-MM-01) |

**1.3.3. `photos`** (첨부 사진) | 컬럼명 | 데이터 타입 | 키/제약조건 | 설명 | | :--- | :--- | :--- | :--- | | `photo_id` | `INTEGER` | `PK, AUTOINCREMENT` | 사진 고유 ID | | `expenditure_id` | `INTEGER` | `FK (expenditures.expenditure_id) ON DELETE CASCADE` | 지출 고유 ID | | `file_path` | `VARCHAR(255)`| `NOT NULL` | 파일 저장 경로 | | `created_at` | `DATETIME` | `DEFAULT CURRENT_TIMESTAMP` | 생성 일시 |

---

### **2. 인덱스 명세 (Index Specifications)**

데이터 조회 성능 최적화를 위해 다음 컬럼에 인덱스를 생성합니다.

| 테이블명          | 인덱스 대상 컬럼                                 | 목적                                      |
| ----------------- | ------------------------------------------------ | ----------------------------------------- |
| `categories`      | `profile_id`                                     | 특정 프로필의 카테고리 빠른 조회          |
| `payment_methods` | `profile_id`                                     | 특정 프로필의 결제 수단 빠른 조회         |
| `expenditures`    | `profile_id`, `category_id`, `payment_method_id` | 특정 프로필 및 조건의 지출 내역 빠른 조회 |
| `payment_history` | `expenditure_id`, `payment_month`                | 특정 지출의 월별 납부 기록 빠른 조회      |
| `status_history`  | `expenditure_id`, `effective_month`              | 특정 지출의 상태 변경 이력 빠른 조회      |
| `photos`          | `expenditure_id`                                 | 특정 지출의 첨부 사진 빠른 조회           |

---

### **3. ERD (Entity Relationship Diagram)**

코드 스니펫

```
erDiagram
    profiles {
        INTEGER profile_id PK
        VARCHAR(100) name
        VARCHAR(3) currency_code
        DATETIME created_at
    }

    categories {
        INTEGER category_id PK
        INTEGER profile_id FK
        VARCHAR(100) name
        BOOLEAN is_default
    }

    payment_methods {
        INTEGER method_id PK
        INTEGER profile_id FK
        VARCHAR(100) name
    }

    expenditures {
        INTEGER expenditure_id PK
        INTEGER profile_id FK
        INTEGER category_id FK
        INTEGER payment_method_id FK
        VARCHAR(255) item_name
        TINYINT payment_day
        VARCHAR(20) payment_cycle
        VARCHAR(20) type
    }

    expenditure_details_regular {
        INTEGER expenditure_id PK, FK
        DECIMAL(12,2) amount
        BOOLEAN is_shared
    }

    expenditure_details_subscription {
        INTEGER expenditure_id PK, FK
        DECIMAL(12,2) amount
        VARCHAR(100) plan_name
    }

    expenditure_details_installment {
        INTEGER expenditure_id PK, FK
        DECIMAL(12,2) principal_amount
        DATE start_month
        TINYINT total_months
    }

    payment_history {
        INTEGER history_id PK
        INTEGER expenditure_id FK
        DATE payment_month
        BOOLEAN is_paid
    }

    status_history {
        INTEGER status_id PK
        INTEGER expenditure_id FK
        VARCHAR(10) status
        DATE effective_month
    }

    photos {
        INTEGER photo_id PK
        INTEGER expenditure_id FK
        VARCHAR(255) file_path
    }

    profiles ||--o{ categories : "has"
    profiles ||--o{ payment_methods : "has"
    profiles ||--o{ expenditures : "has"

    categories ||--o{ expenditures : "classifies"
    payment_methods ||--o{ expenditures : "pays_with"

    expenditures ||--|| expenditure_details_regular : "is_a"
    expenditures ||--|| expenditure_details_subscription : "is_a"
    expenditures ||--|| expenditure_details_installment : "is_a"

    expenditures ||--o{ payment_history : "has"
    expenditures ||--o{ status_history : "has"
    expenditures ||--o{ photos : "has"
```

---

### **4. 기능 연계 최적화 (Feature-driven Index & Constraints)**

#### DASH-001 (월별 요약 정보)

- 조회 패턴 반영 인덱스:
  - `status_history (expenditure_id, effective_month)` 복합 인덱스
  - `payment_history (expenditure_id, payment_month)` 복합 인덱스
  - `expenditures (profile_id, category_id)` 복합 인덱스
  - `expenditure_details_*` 테이블의 `expenditure_id` 기본 인덱스 확인
  - `expenditures (created_at)` 정렬 최적화 인덱스
- 권장 제약조건:
  - `status_history.status` IN ('active','paused') CHECK
  - `payment_history.payment_month`는 월 첫날(YYYY-MM-01) CHECK

#### ENTRY-001 (신규 지출 생성)

- 트랜잭션 필요: `expenditures` → `expenditure_details_*` → `status_history`
- 외래키: 상세 테이블의 `expenditure_id`는 `expenditures.expenditure_id` 참조

#### ACTION-001 (납부 완료 처리)

- UPSERT 패턴:
  - `payment_history`에 `(expenditure_id, payment_month)` UNIQUE 제약 추가 권장
  - 충돌 시 `is_paid = true, paid_timestamp = NOW()` 업데이트

#### ACTION-002 (일시정지/재활성화)

- 월별 상태 이력 누적: 동일 `(expenditure_id, effective_month)` 중복 방지 위해 UNIQUE 권장

#### REPORT-001 (기간 리포트)

- 기간 조회 최적화:
  - `payment_history (payment_month)` 인덱스
  - `status_history (effective_month)` 인덱스
  - 카테고리별 그룹 집계를 위한 `expenditures (category_id)` 인덱스

---

### **5. 제약조건 및 인덱스 DDL 예시**

```sql
-- ACTION-001: 납부 완료 처리 UPSERT 대비
ALTER TABLE payment_history
  ADD CONSTRAINT uq_payment_history UNIQUE (expenditure_id, payment_month);

-- ACTION-002: 상태 이력 중복 방지
ALTER TABLE status_history
  ADD CONSTRAINT uq_status_month UNIQUE (expenditure_id, effective_month);

-- 상태값 체크
ALTER TABLE status_history
  ADD CONSTRAINT ck_status CHECK (status IN ('active','paused'));

-- 월 첫날 체크 (PostgreSQL 표현)
ALTER TABLE payment_history
  ADD CONSTRAINT ck_payment_month_firstday CHECK (EXTRACT(DAY FROM payment_month) = 1);

-- DASH/REPORT 최적화 인덱스
CREATE INDEX IF NOT EXISTS idx_payment_history_month ON payment_history(payment_month);
CREATE INDEX IF NOT EXISTS idx_status_history_month ON status_history(effective_month);
CREATE INDEX IF NOT EXISTS idx_expenditures_profile_category ON expenditures(profile_id, category_id);
CREATE INDEX IF NOT EXISTS idx_expenditures_created_at ON expenditures(created_at);
```

### **6. 제약조건 최종 확정 (UNIQUE / INDEX / CHECK)**

```sql
-- 납부 기록: 월 중복 방지 및 멱등 처리 기반
ALTER TABLE payment_history
  ADD CONSTRAINT uq_payment_history UNIQUE (expenditure_id, payment_month);
CREATE INDEX IF NOT EXISTS idx_payment_history_month ON payment_history(payment_month);

-- 상태 이력: 월 중복 방지
ALTER TABLE status_history
  ADD CONSTRAINT uq_status_month UNIQUE (expenditure_id, effective_month);
CREATE INDEX IF NOT EXISTS idx_status_history_month ON status_history(effective_month);

-- 상태값 제한
ALTER TABLE status_history
  ADD CONSTRAINT ck_status CHECK (status IN ('active','paused'));

-- 월 첫날 보장 (yyyy-mm-01)
ALTER TABLE payment_history
  ADD CONSTRAINT ck_payment_month_firstday CHECK (EXTRACT(DAY FROM payment_month) = 1);

-- 지출 조회 최적화
CREATE INDEX IF NOT EXISTS idx_expenditures_profile_category ON expenditures(profile_id, category_id);
CREATE INDEX IF NOT EXISTS idx_expenditures_created_at ON expenditures(created_at);
```
