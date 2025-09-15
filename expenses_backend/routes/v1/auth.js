const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { User, Profile } = require('../../models');
const { generateToken, authenticateToken } = require('../../middleware/auth');
const { sequelize } = require('../../models');

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: 인증 관련 API
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: 회원가입 및 기본 프로필 생성
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name, profileName]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *               profileName:
 *                 type: string
 *               currencyCode:
 *                 type: string
 *                 example: KRW
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: 유효성 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 이메일 중복
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// POST /api/v1/auth/register
router.post('/auth/register', [
  body('email').isEmail().normalizeEmail().withMessage('유효한 이메일을 입력해주세요'),
  body('password').isLength({ min: 6 }).withMessage('비밀번호는 6자 이상이어야 합니다'),
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('이름은 1-100자 사이여야 합니다'),
  body('profileName').trim().isLength({ min: 1, max: 100 }).withMessage('프로필 이름은 1-100자 사이여야 합니다')
], async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '입력 데이터가 유효하지 않습니다', details: errors.array() }
      });
    }

    const { email, password, name, profileName, currencyCode = 'KRW' } = req.body;

    // 이메일 중복 확인
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: '이미 사용 중인 이메일입니다' }
      });
    }

    // 사용자 생성
    const user = await User.create({
      email,
      password,
      name
    }, { transaction });

    // 기본 프로필 생성
    const profile = await Profile.create({
      userId: user.id,
      name: profileName,
      currencyCode
    }, { transaction });

    await transaction.commit();

    // 토큰 생성
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isVerified: user.isVerified
        },
        profile: {
          id: profile.id,
          name: profile.name,
          currencyCode: profile.currencyCode
        },
        token
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '회원가입 중 오류가 발생했습니다' }
    });
  }
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: 로그인 및 JWT 발급
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: 유효성 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// POST /api/v1/auth/login
router.post('/auth/login', [
  body('email').isEmail().normalizeEmail().withMessage('유효한 이메일을 입력해주세요'),
  body('password').notEmpty().withMessage('비밀번호를 입력해주세요')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '입력 데이터가 유효하지 않습니다', details: errors.array() }
      });
    }

    const { email, password } = req.body;

    // 사용자 찾기
    const user = await User.findOne({
      where: { email },
      include: [{
        model: Profile,
        as: 'profiles'
      }]
    });

    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '이메일 또는 비밀번호가 올바르지 않습니다' }
      });
    }

    // 마지막 로그인 시간 업데이트
    await user.update({ lastLoginAt: new Date() });

    // 토큰 생성
    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isVerified: user.isVerified,
          lastLoginAt: user.lastLoginAt
        },
        profiles: user.profiles.map(profile => ({
          id: profile.id,
          name: profile.name,
          currencyCode: profile.currencyCode
        })),
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '로그인 중 오류가 발생했습니다' }
    });
  }
});

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: 내 정보 조회
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: 토큰 없음/유효하지 않음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// GET /api/v1/auth/me
router.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Profile,
        as: 'profiles'
      }]
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isVerified: user.isVerified,
          lastLoginAt: user.lastLoginAt
        },
        profiles: user.profiles.map(profile => ({
          id: profile.id,
          name: profile.name,
          currencyCode: profile.currencyCode
        }))
      }
    });

  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '사용자 정보 조회 중 오류가 발생했습니다' }
    });
  }
});

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: 액세스 토큰 갱신
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 갱신 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// POST /api/v1/auth/refresh
router.post('/auth/refresh', authenticateToken, async (req, res) => {
  try {
    const token = generateToken(req.user);

    res.json({
      success: true,
      data: { token }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '토큰 갱신 중 오류가 발생했습니다' }
    });
  }
});

module.exports = router;