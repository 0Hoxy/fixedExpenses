const express = require('express');
const Expense = require('../models/Expense');
const router = express.Router();

// 모든 고정비 조회
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.findAll();
    res.json({
      success: true,
      data: expenses,
      count: expenses.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ID로 고정비 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: '고정비를 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 새 고정비 생성
router.post('/', async (req, res) => {
  try {
    const { name, amount, category_id, description } = req.body;

    // 입력 검증
    if (!name || !amount || !category_id) {
      return res.status(400).json({
        success: false,
        error: '필수 필드가 누락되었습니다 (name, amount, category_id)'
      });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: '금액은 0보다 큰 숫자여야 합니다'
      });
    }

    const expenseData = {
      name: name.trim(),
      amount: parseInt(amount),
      category_id: category_id.trim(),
      description: description ? description.trim() : null
    };

    const expense = await Expense.create(expenseData);

    res.status(201).json({
      success: true,
      data: expense,
      message: '고정비가 성공적으로 생성되었습니다'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 고정비 수정
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, category_id, description } = req.body;

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        error: '고정비를 찾을 수 없습니다'
      });
    }

    // 입력 검증
    if (amount && (typeof amount !== 'number' || amount <= 0)) {
      return res.status(400).json({
        success: false,
        error: '금액은 0보다 큰 숫자여야 합니다'
      });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (amount) updateData.amount = parseInt(amount);
    if (category_id) updateData.category_id = category_id.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;

    const updatedExpense = await expense.update(updateData);

    res.json({
      success: true,
      data: updatedExpense,
      message: '고정비가 성공적으로 수정되었습니다'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 고정비 삭제
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        error: '고정비를 찾을 수 없습니다'
      });
    }

    await expense.delete();

    res.json({
      success: true,
      message: '고정비가 성공적으로 삭제되었습니다'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 총 고정비 합계 조회
router.get('/stats/total', async (req, res) => {
  try {
    const totalAmount = await Expense.getTotalAmount();
    res.json({
      success: true,
      data: {
        total_amount: totalAmount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 카테고리별 통계 조회
router.get('/stats/categories', async (req, res) => {
  try {
    const categoryStats = await Expense.getCategoryStats();
    res.json({
      success: true,
      data: categoryStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
