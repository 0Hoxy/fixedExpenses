const express = require('express');
const Category = require('../models/Category');
const router = express.Router();

// 모든 카테고리 조회
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ID로 카테고리 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: '카테고리를 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 새 카테고리 생성
router.post('/', async (req, res) => {
  try {
    const { id, name, icon, color } = req.body;

    // 입력 검증
    if (!id || !name || !icon || !color) {
      return res.status(400).json({
        success: false,
        error: '필수 필드가 누락되었습니다 (id, name, icon, color)'
      });
    }

    // ID 중복 확인
    const existingCategory = await Category.findById(id);
    if (existingCategory) {
      return res.status(409).json({
        success: false,
        error: '이미 존재하는 카테고리 ID입니다'
      });
    }

    const categoryData = {
      id: id.trim(),
      name: name.trim(),
      icon: icon.trim(),
      color: color.trim()
    };

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      data: category,
      message: '카테고리가 성공적으로 생성되었습니다'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 카테고리 수정
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: '카테고리를 찾을 수 없습니다'
      });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (icon) updateData.icon = icon.trim();
    if (color) updateData.color = color.trim();

    const updatedCategory = await category.update(updateData);

    res.json({
      success: true,
      data: updatedCategory,
      message: '카테고리가 성공적으로 수정되었습니다'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 카테고리 삭제
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: '카테고리를 찾을 수 없습니다'
      });
    }

    await category.delete();

    res.json({
      success: true,
      message: '카테고리가 성공적으로 삭제되었습니다'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
