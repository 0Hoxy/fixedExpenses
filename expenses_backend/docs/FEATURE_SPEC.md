# 기능 명세서 (Feature Specification)

## 1. 대시보드 및 핵심 UI

### 1.1. 월별 요약 정보 표시

- **기능 ID**: DASH-001
- **기능명**: 월별 요약 정보 표시
- **설명**: 현재 월의 핵심 지출 정보를 대시보드에 요약하여 표시합니다.
- **관련 테이블 (Read)**: `profiles`, `expenditures`, `expenditure_details_regular`, `expenditure_details_subscription`, `expenditure_details_installment`, `payment_history`, `status_history`, `categories`
- **실행 순서**:
  1. 활성 `profiles.profile_id` 기준으로 현재 월(YYYY-MM)의 데이터를 조회
  2. `status_history`를 참조하여 현재 월에 'active' 상태인 `expenditures`만 필터링
  3. 각 항목의 `type`에 맞는 상세 테이블(`expenditure_details_*`)과 JOIN하여 월 납부액 취득, 총합 계산
  4. 동일 로직으로 지난달 총액 계산, 비교 메시지 생성
  5. 오늘 이후 결제 예정 중 가장 가까운 항목 조회
  6. 현재 월 총액 기준 `categories`별 합계 계산 → 비중 그래프 데이터 생성
- **결과**: 현재 월 총 고정지출, 지난달 대비 메시지, 다가오는 결제 건, 카테고리별 지출 그래프 표시

---

## 2. 데이터 입력 및 관리

### 2.1. 신규 지출 항목 생성

- **기능 ID**: ENTRY-001
- **기능명**: 신규 지출 항목 생성
- **설명**: 사용자가 새로운 고정 지출 항목(일반, 구독, 할부)을 등록합니다.
- **관련 테이블 (Create)**: `expenditures`, `expenditure_details_regular | subscription | installment`, `status_history`
- **실행 순서**:
  1. 유형 선택: 일반/구독/할부
  2. 공통 정보 입력: `item_name`, `category_id`, `payment_day`, `payment_cycle`, `type`, `memo`
  3. 유형별 상세 입력: 일반-`amount`, 구독-`amount`, 할부-`principal_amount` 등
  4. 저장 시 `expenditures`에 공통 정보 저장 → `expenditure_id` 반환
  5. 반환된 `expenditure_id`로 해당 상세 테이블에 레코드 생성
  6. `status_history`에 `{expenditure_id, 'active', 현재월}` 기록 생성
- **결과**: 공통/상세 정보가 각 테이블에 저장됨

### 2.2. 납부 완료 처리 (UX)

- 성공: 상단 합계/리스트 배지 즉시 갱신, 스낵바 "납부 완료 처리됨"
- 실패: 스낵바 오류 메시지 + 되돌리기(Undo) 제공 가능

### 2.3. 지출 일시정지 및 재활성화 (UX)

- 성공: 목록 상태 칩 변경, 스낵바 "상태 변경됨"
- 실패: 스낵바 오류 메시지

### 2.4. 사진 첨부

- **기능 ID**: PHOTO-001
- **기능명**: 지출 항목에 사진 첨부
- **설명**: 계약서/영수증 등 이미지를 항목에 첨부하여 관리
- **관련 테이블 (Create)**: `photos`
- **실행 순서**:
  1. 사진 첨부 → 카메라/앨범 선택
  2. 선택 이미지 앱 내부 저장소에 저장
  3. `photos`에 `{expenditure_id, file_path}` 기록
- **결과**: 파일이 저장되고 항목과 연결됨

---

## 3. 분석 및 리포트

### 3.1. 기간별 리포트 생성

- **기능 ID**: REPORT-001
- **기능명**: 기간별 지출 리포트 조회
- **설명**: 기간 내 월별 추이/카테고리별 통계를 시각화
- **관련 테이블 (Read)**: `expenditures`, `expenditure_details_*`, `status_history`, `categories`
- **실행 순서**:
  1. 시작월, 종료월 지정
  2. 각 월 반복 계산:
     - `status_history`로 해당 월 'active' 항목 조회
     - 각 항목의 월 납부액을 상세 테이블에서 합산
  3. 월별 총액으로 '지출 추이 그래프' 생성
  4. 기간 전체 데이터를 `categories`별 그룹합으로 '카테고리별 분석' 생성
- **결과**: 선택 기간에 대한 통계 리포트 표시

---

## 4. 데이터 관리

### 4.1. 데이터 백업

- **기능 ID**: DATA-001
- **기능명**: 로컬 데이터 백업
- **설명**: 모든 테이블 데이터를 구조화하여 단일 백업 파일 생성
- **관련 테이블 (Read)**: 모든 테이블 (`profiles`, `categories`, `expenditures`, `expenditure_details_*`, `payment_history`, `status_history`, `photos` 등)
- **실행 순서**:
  1. 모든 테이블 데이터를 JSON 등 구조화된 형태로 추출
  2. `photos.file_path`의 이미지 파일을 함께 압축에 포함
  3. 앱 버전 정보 및 암호화 적용 후 최종 백업 파일 생성
  4. OS 공유/저장 기능으로 사용자에게 전달
- **결과**: 암호화된 백업 파일 생성

### 4.2. 데이터 복원

- **기능 ID**: DATA-002
- **기능명**: 백업 파일로부터 데이터 복원
- **설명**: 백업 파일로 앱 데이터를 특정 시점으로 복원
- **관련 테이블 (Delete/Create)**: 모든 테이블
- **실행 순서**:
  1. 백업 파일 선택 → 복호화 및 버전 확인
  2. (필요시) 구버전 스키마 → 현버전 스키마 변환 마이그레이션 수행
  3. 트랜잭션 시작 → 기존 데이터 삭제
  4. 백업 데이터 순서대로 Insert
  5. 이미지 파일들을 내부 저장소 경로에 복원
  6. 성공 시 Commit, 오류 시 Rollback
- **결과**: 데이터가 백업 시점으로 완전 복원됨
