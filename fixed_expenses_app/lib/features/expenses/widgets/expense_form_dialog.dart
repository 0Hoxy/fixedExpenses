import 'package:flutter/material.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/models/expense.dart';

class ExpenseFormDialog extends StatefulWidget {
  final Expense? expense;
  final void Function(Expense) onSubmit;

  const ExpenseFormDialog({
    super.key,
    this.expense,
    required this.onSubmit,
  });

  @override
  State<ExpenseFormDialog> createState() => _ExpenseFormDialogState();
}

class _ExpenseFormDialogState extends State<ExpenseFormDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _amountController = TextEditingController();
  String _selectedCategory = 'housing';

  @override
  void initState() {
    super.initState();
    if (widget.expense != null) {
      _nameController.text = widget.expense!.name;
      _amountController.text = widget.expense!.amount.toString();
      _selectedCategory = widget.expense!.categoryId;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.expense == null ? '고정비 추가' : '고정비 수정'),
      content: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: '고정비 이름',
                hintText: '예: 월세, 통신비',
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return AppConstants.errorInvalidName;
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _amountController,
              decoration: const InputDecoration(
                labelText: '금액',
                hintText: '예: 500000',
                suffixText: AppConstants.currencySymbol,
              ),
              keyboardType: TextInputType.number,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return AppConstants.errorInvalidAmount;
                }
                final amount = int.tryParse(value);
                if (amount == null || amount < AppConstants.minExpenseAmount) {
                  return AppConstants.errorInvalidAmount;
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _selectedCategory,
              decoration: const InputDecoration(
                labelText: '카테고리',
              ),
              items: const [
                DropdownMenuItem(value: 'housing', child: Text('🏠 주거비')),
                DropdownMenuItem(value: 'utilities', child: Text('📱 통신비')),
                DropdownMenuItem(value: 'insurance', child: Text('🛡️ 보험')),
                DropdownMenuItem(value: 'transportation', child: Text('🚗 교통비')),
                DropdownMenuItem(value: 'food', child: Text('🍽️ 식비')),
                DropdownMenuItem(value: 'healthcare', child: Text('🏥 의료비')),
                DropdownMenuItem(value: 'education', child: Text('📚 교육비')),
                DropdownMenuItem(value: 'entertainment', child: Text('🎬 엔터테인먼트')),
                DropdownMenuItem(value: 'other', child: Text('📦 기타')),
              ],
              onChanged: (value) {
                if (value != null) {
                  setState(() {
                    _selectedCategory = value;
                  });
                }
              },
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('취소'),
        ),
        ElevatedButton(
          onPressed: _handleSubmit,
          child: Text(widget.expense == null ? '추가' : '수정'),
        ),
      ],
    );
  }

  void _handleSubmit() {
    if (_formKey.currentState!.validate()) {
      final expense = Expense(
        id: widget.expense?.id ?? DateTime.now().millisecondsSinceEpoch.toString(),
        name: _nameController.text,
        amount: int.parse(_amountController.text),
        categoryId: _selectedCategory,
        createdAt: widget.expense?.createdAt ?? DateTime.now(),
        updatedAt: DateTime.now(),
      );

      widget.onSubmit(expense);
      Navigator.of(context).pop();
    }
  }
}


