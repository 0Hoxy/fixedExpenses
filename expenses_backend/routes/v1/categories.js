const express = require('express');
const router = express.Router();
const { Category, Profile } = require('../../models');
const { authenticateToken, checkProfileOwnership } = require('../../middleware/auth');

/**
 * @openapi
 * tags:
 *   - name: Categories
 *     description: 카테고리 관리 API
 */

/**
 * @openapi
 * /profiles/{profileId}/categories:
 *   get:
 *     tags: [Categories]
 *     summary: 프로필의 카테고리 목록 조회
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 프로필 없음
 */
// GET /api/v1/profiles/:profileId/categories
router.get('/profiles/:profileId/categories', authenticateToken, checkProfileOwnership, async (req, res) => {
  try {
    const { profileId } = req.params;

    // Profile 존재 여부 확인
    const profile = await Profile.findByPk(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '프로필을 찾을 수 없습니다' }
      });
    }

    // 프로필의 카테고리 목록 조회
    const categories = await Category.findAll({
      where: { profileId },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error('GET /profiles/:profileId/categories error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

/**
 * @openapi
 * /profiles/{profileId}/categories:
 *   post:
 *     tags: [Categories]
 *     summary: 카테고리 생성
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: 생성됨
 *       400:
 *         description: 유효성 오류
 *       404:
 *         description: 프로필 없음
 *       409:
 *         description: 중복 이름
 */
// POST /api/v1/profiles/:profileId/categories
router.post('/profiles/:profileId/categories', authenticateToken, checkProfileOwnership, async (req, res) => {
  try {
    const { profileId } = req.params;
    const { name, icon, color, isDefault } = req.body;

    // 필수 필드 검증
    if (!name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '카테고리 이름은 필수입니다' }
      });
    }

    // Profile 존재 여부 확인
    const profile = await Profile.findByPk(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '프로필을 찾을 수 없습니다' }
      });
    }

    // 중복 이름 확인
    const existingCategory = await Category.findOne({
      where: { profileId, name: name.trim() }
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: '이미 존재하는 카테고리 이름입니다' }
      });
    }

    // 카테고리 생성
    const categoryData = {
      profileId,
      name: name.trim(),
      icon: icon?.trim() || null,
      color: color?.trim() || null,
      isDefault: isDefault ?? false
    };

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      data: category
    });
    res.set('Location', `/api/v1/categories/${category.id}`);

  } catch (error) {
    console.error('POST /profiles/:profileId/categories error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

module.exports = router;
