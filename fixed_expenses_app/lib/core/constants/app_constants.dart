class AppConstants {
  // 앱 정보
  static const String appName = '고정비 관리 앱';
  static const String appVersion = '1.0.0';
  
  // 데이터베이스 관련
  static const String databaseName = 'expenses.db';
  static const int databaseVersion = 1;
  
  // UI 관련
  static const double defaultPadding = 16.0;
  static const double smallPadding = 8.0;
  static const double largePadding = 24.0;
  
  static const double defaultBorderRadius = 12.0;
  static const double smallBorderRadius = 8.0;
  static const double largeBorderRadius = 16.0;
  
  // 애니메이션 관련
  static const Duration defaultAnimationDuration = Duration(milliseconds: 300);
  static const Duration fastAnimationDuration = Duration(milliseconds: 150);
  static const Duration slowAnimationDuration = Duration(milliseconds: 500);
  
  // 유효성 검사 관련
  static const int minExpenseAmount = 0;
  static const int maxExpenseAmount = 999999999;
  static const int minExpenseNameLength = 1;
  static const int maxExpenseNameLength = 50;
  
  // 날짜 형식
  static const String dateFormat = 'yyyy-MM-dd';
  static const String dateTimeFormat = 'yyyy-MM-dd HH:mm:ss';
  static const String displayDateFormat = 'yyyy년 MM월 dd일';
  
  // 통화 형식
  static const String currencySymbol = '원';
  static const String currencyCode = 'KRW';
  
  // 에러 메시지
  static const String errorExpenseNotFound = '고정비를 찾을 수 없습니다.';
  static const String errorInvalidAmount = '올바른 금액을 입력해주세요.';
  static const String errorInvalidName = '올바른 이름을 입력해주세요.';
  static const String errorNetworkConnection = '네트워크 연결을 확인해주세요.';
  
  // 성공 메시지
  static const String successExpenseAdded = '고정비가 추가되었습니다.';
  static const String successExpenseUpdated = '고정비가 수정되었습니다.';
  static const String successExpenseDeleted = '고정비가 삭제되었습니다.';
  
  // 확인 메시지
  static const String confirmDeleteExpense = '정말로 이 고정비를 삭제하시겠습니까?';
  static const String confirmResetData = '모든 데이터를 초기화하시겠습니까?';
}
