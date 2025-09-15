import '../models/expense.dart';
import '../models/category.dart';
import 'api_service.dart';

class ExpenseService {
  static final ExpenseService _instance = ExpenseService._internal();
  factory ExpenseService() => _instance;
  ExpenseService._internal();

  // 로컬 캐시 (오프라인 지원)
  List<Expense> _expenses = [];
  bool _isInitialized = false;

  // 초기화 (API에서 데이터 로드)
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      _expenses = await ApiService.getAllExpenses();
      _isInitialized = true;
    } catch (e) {
      // 오프라인 모드: 기본 데이터 사용
      _expenses = [
        Expense(
          id: '1',
          name: '월세',
          amount: 500000,
          categoryId: 'housing',
          categoryName: '주거비',
          categoryIcon: '🏠',
          categoryColor: '#FF6B6B',
          createdAt: DateTime.now().subtract(const Duration(days: 30)),
        ),
        Expense(
          id: '2',
          name: '통신비',
          amount: 80000,
          categoryId: 'utilities',
          categoryName: '통신비',
          categoryIcon: '📱',
          categoryColor: '#4ECDC4',
          createdAt: DateTime.now().subtract(const Duration(days: 15)),
        ),
        Expense(
          id: '3',
          name: '보험료',
          amount: 120000,
          categoryId: 'insurance',
          categoryName: '보험',
          categoryIcon: '🛡️',
          categoryColor: '#45B7D1',
          createdAt: DateTime.now().subtract(const Duration(days: 10)),
        ),
      ];
      _isInitialized = true;
    }
  }

  // 모든 고정비 조회
  List<Expense> getAllExpenses() {
    return List.from(_expenses);
  }

  // 고정비 추가
  Future<Expense> addExpense({
    required String name,
    required int amount,
    required String category,
  }) async {
    try {
      // API 호출
      final expense = await ApiService.createExpense(
        name: name,
        amount: amount,
        category: category,
      );
      
      // 로컬 캐시 업데이트
      _expenses.add(expense);
      return expense;
    } catch (e) {
      // 오프라인 모드: 로컬에만 저장
      final expense = Expense(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        name: name,
        amount: amount,
        categoryId: category,
        createdAt: DateTime.now(),
      );
      
      _expenses.add(expense);
      return expense;
    }
  }

  // 고정비 수정
  Future<Expense> updateExpense({
    required String id,
    String? name,
    int? amount,
    String? category,
  }) async {
    final index = _expenses.indexWhere((expense) => expense.id == id);
    if (index == -1) {
      throw Exception('고정비를 찾을 수 없습니다.');
    }

    final expense = _expenses[index];
    final updatedExpense = expense.copyWith(
      name: name,
      amount: amount,
      categoryId: category,
      updatedAt: DateTime.now(),
    );

    _expenses[index] = updatedExpense;
    return updatedExpense;
  }

  // 고정비 삭제
  Future<void> deleteExpense(String id) async {
    _expenses.removeWhere((expense) => expense.id == id);
  }

  // 카테고리별 고정비 조회
  List<Expense> getExpensesByCategory(String category) {
    return _expenses.where((expense) => expense.category == category).toList();
  }

  // 총 고정비 계산
  int getTotalExpenses() {
    return _expenses.fold(0, (sum, expense) => sum + expense.amount);
  }

  // 카테고리별 총액 계산
  Map<String, int> getTotalByCategory() {
    final Map<String, int> categoryTotals = {};
    
    for (final expense in _expenses) {
      categoryTotals[expense.category] = 
          (categoryTotals[expense.category] ?? 0) + expense.amount;
    }
    
    return categoryTotals;
  }

  // 월별 고정비 조회
  List<Expense> getExpensesByMonth(DateTime month) {
    return _expenses.where((expense) {
      return expense.createdAt.year == month.year &&
             expense.createdAt.month == month.month;
    }).toList();
  }

  // 고정비 검색
  List<Expense> searchExpenses(String query) {
    if (query.isEmpty) return _expenses;
    
    return _expenses.where((expense) {
      return expense.name.toLowerCase().contains(query.toLowerCase()) ||
             expense.category.toLowerCase().contains(query.toLowerCase());
    }).toList();
  }
}
