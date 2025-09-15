import 'package:flutter/material.dart';
import '../../../shared/models/expense.dart';
import '../../../shared/widgets/expense_card.dart';

class ExpensesListView extends StatelessWidget {
  final List<Expense> expenses;
  final void Function(Expense) onEdit;
  final void Function(Expense) onDelete;

  const ExpensesListView({
    super.key,
    required this.expenses,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: expenses.length,
      itemBuilder: (context, index) {
        final expense = expenses[index];
        return ExpenseCard(
          expense: expense,
          onEdit: () => onEdit(expense),
          onDelete: () => onDelete(expense),
        );
      },
    );
  }
}


