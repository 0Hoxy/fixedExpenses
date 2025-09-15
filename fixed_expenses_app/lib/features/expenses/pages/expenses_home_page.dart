import 'package:flutter/material.dart';
import '../../../shared/models/expense.dart';
import '../../../shared/services/expense_service.dart';
import '../../../shared/widgets/expense_card.dart';
import '../../../shared/widgets/total_expense_card.dart';
import '../../../core/constants/app_constants.dart';
import '../widgets/expenses_empty_state.dart';
import '../widgets/expenses_list_view.dart';
import '../widgets/expense_form_dialog.dart';

class ExpensesHomePage extends StatefulWidget {
  const ExpensesHomePage({super.key});

  @override
  State<ExpensesHomePage> createState() => _ExpensesHomePageState();
}

class _ExpensesHomePageState extends State<ExpensesHomePage> {
  final ExpenseService _expenseService = ExpenseService();
  List<Expense> _expenses = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadExpenses();
  }

  void _loadExpenses() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      // API에서 데이터 로드
      await _expenseService.initialize();
      setState(() {
        _expenses = _expenseService.getAllExpenses();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      // 에러 처리
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('데이터 로드 실패: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _addExpense() {
    showDialog(
      context: context,
      builder: (context) => ExpenseFormDialog(
        onSubmit: (expense) {
          setState(() {
            _expenses.add(expense);
          });
        },
      ),
    );
  }

  void _editExpense(Expense expense) {
    showDialog(
      context: context,
      builder: (context) => ExpenseFormDialog(
        expense: expense,
        onSubmit: (updatedExpense) {
          setState(() {
            final index = _expenses.indexWhere((e) => e.id == expense.id);
            if (index != -1) {
              _expenses[index] = updatedExpense;
            }
          });
        },
      ),
    );
  }

  void _deleteExpense(Expense expense) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('고정비 삭제'),
        content: Text('${expense.name}을(를) 삭제하시겠습니까?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              setState(() {
                _expenses.removeWhere((e) => e.id == expense.id);
              });
            },
            child: const Text('삭제', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('고정비 관리'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadExpenses,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // 총 고정비 카드
                Padding(
                  padding: const EdgeInsets.all(AppConstants.defaultPadding),
                  child: TotalExpenseCard(
                    totalAmount: _expenseService.getTotalExpenses(),
                    onTap: () {
                      // 통계 페이지로 이동
                    },
                  ),
                ),
                
                // 고정비 목록
                Expanded(
                  child: _expenses.isEmpty
                      ? const ExpensesEmptyState()
                      : ExpensesListView(
                          expenses: _expenses,
                          onEdit: _editExpense,
                          onDelete: _deleteExpense,
                        ),
                ),
              ],
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addExpense,
        tooltip: '고정비 추가',
        child: const Icon(Icons.add),
      ),
    );
  }
}
