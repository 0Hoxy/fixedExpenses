const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Expenditure, Profile, Category, PaymentMethod, ExpenditureDetailsRegular, ExpenditureDetailsSubscription, ExpenditureDetailsInstallment, StatusHistory, sequelize } = require('../../models');

// POST /api/v1/profiles/:profileId/expenditures
router.post('/profiles/:profileId/expenditures', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { profileId } = req.params;
    const { itemName, type, categoryId, paymentDay, paymentCycle, memo, detail, paymentMethodId } = req.body;

    // 필수 필드 검증
    if (!itemName || !type || !categoryId || !paymentDay || !paymentCycle || !detail) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '필수 필드가 누락되었습니다 (itemName, type, categoryId, paymentDay, paymentCycle, detail)' }
      });
    }

    // 타입 검증
    if (!['REGULAR', 'SUBSCRIPTION', 'INSTALLMENT'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '유효하지 않은 지출 유형입니다' }
      });
    }

    // 결제일 검증
    if (typeof paymentDay !== 'number' || paymentDay < 1 || paymentDay > 31) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '결제일은 1-31 사이의 숫자여야 합니다' }
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

    // Category 존재 여부 확인
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '카테고리를 찾을 수 없습니다' }
      });
    }

    // PaymentMethod 존재 여부 확인 (옵션)
    if (paymentMethodId) {
      const paymentMethod = await PaymentMethod.findByPk(paymentMethodId);
      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: '결제 수단을 찾을 수 없습니다' }
        });
      }
    }

    // Expenditure 생성
    const expenditureData = {
      profileId,
      categoryId,
      paymentMethodId: paymentMethodId || null,
      itemName: itemName.trim(),
      paymentDay,
      paymentCycle,
      type,
      memo: memo?.trim() || null
    };

    const expenditure = await Expenditure.create(expenditureData, { transaction });

    // 타입별 상세 정보 생성
    let detailModel;
    switch (type) {
      case 'REGULAR':
        if (!detail.amount) {
          throw new Error('REGULAR 타입은 amount가 필요합니다');
        }
        detailModel = await ExpenditureDetailsRegular.create({
          expenditureId: expenditure.id,
          amount: detail.amount,
          isShared: detail.isShared || false,
          totalAmount: detail.totalAmount || null,
          shareType: detail.shareType || null
        }, { transaction });
        break;

      case 'SUBSCRIPTION':
        if (!detail.amount) {
          throw new Error('SUBSCRIPTION 타입은 amount가 필요합니다');
        }
        detailModel = await ExpenditureDetailsSubscription.create({
          expenditureId: expenditure.id,
          amount: detail.amount,
          planName: detail.planName || null,
          reminderDaysBefore: detail.reminderDaysBefore || 0
        }, { transaction });
        break;

      case 'INSTALLMENT':
        if (!detail.principalAmount || !detail.monthlyPayment || !detail.startMonth || !detail.totalMonths) {
          throw new Error('INSTALLMENT 타입은 principalAmount, monthlyPayment, startMonth, totalMonths가 필요합니다');
        }
        detailModel = await ExpenditureDetailsInstallment.create({
          expenditureId: expenditure.id,
          principalAmount: detail.principalAmount,
          monthlyPayment: detail.monthlyPayment,
          startMonth: new Date(detail.startMonth),
          totalMonths: detail.totalMonths,
          interestType: detail.interestType || 'none',
          interestValue: detail.interestValue || null
        }, { transaction });
        break;
    }

    // 현재 월에 active 상태로 추가
    const currentMonth = new Date();
    currentMonth.setDate(1); // 월 첫날로 설정
    await StatusHistory.create({
      expenditureId: expenditure.id,
      status: 'active',
      effectiveMonth: currentMonth
    }, { transaction });

    await transaction.commit();

    // 생성된 expenditure를 관련 정보와 함께 조회
    const createdExpenditure = await Expenditure.findByPk(expenditure.id, {
      include: [
        { model: Category, as: 'category' },
        { model: PaymentMethod, as: 'paymentMethod' }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdExpenditure
    });
    res.set('Location', `/api/v1/expenditures/${expenditure.id}`);

  } catch (error) {
    await transaction.rollback();
    console.error('POST /profiles/:profileId/expenditures error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

// GET /api/v1/profiles/:profileId/expenditures
router.get('/profiles/:profileId/expenditures', async (req, res) => {
  try {
    const { profileId } = req.params;
    const {
      page = 1,
      limit = 20,
      categoryId,
      isActive,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    // 페이지네이션 검증
    const offset = (parseInt(page) - 1) * parseInt(limit);
    if (offset < 0 || parseInt(limit) <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '잘못된 페이지네이션 파라미터입니다' }
      });
    }

    // Profile 존재 여부 확인 (선택적)
    const profile = await Profile.findByPk(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '프로필을 찾을 수 없습니다' }
      });
    }

    // WHERE 조건 구성
    const whereCondition = { profileId };

    if (categoryId) {
      whereCondition.categoryId = categoryId;
    }

    if (search) {
      whereCondition[Op.or] = [
        { itemName: { [Op.iLike]: `%${search}%` } },
        { memo: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // 월별 필터 처리 (상태 이력 기반)
    let statusFilter = null;
    if (req.query.month) {
      const targetMonth = new Date(req.query.month + '-01');
      statusFilter = {
        model: StatusHistory,
        as: 'statusHistory',
        where: {
          effectiveMonth: {
            [Op.lte]: targetMonth
          },
          status: isActive !== 'false' ? 'active' : 'paused'
        },
        required: true
      };
    }

    // 정렬 검증
    const validSortFields = ['created_at', 'updated_at', 'itemName', 'paymentDay'];
    const validSortOrders = ['ASC', 'DESC'];

    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // 지출 목록 조회
    const includeModels = [
      { model: Category, as: 'category' },
      { model: PaymentMethod, as: 'paymentMethod' }
    ];

    if (statusFilter) {
      includeModels.push(statusFilter);
    }

    const { rows: expenditures, count: totalCount } = await Expenditure.findAndCountAll({
      where: whereCondition,
      include: includeModels,
      order: [[finalSortBy, finalSortOrder]],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    // 페이지네이션 메타데이터
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNext = parseInt(page) < totalPages;
    const hasPrev = parseInt(page) > 1;

    res.json({
      success: true,
      data: expenditures,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: parseInt(limit),
        hasNext,
        hasPrev
      }
    });
  } catch (error) {
    console.error('GET /profiles/:profileId/expenditures error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

// GET /api/v1/expenditures/:id
router.get('/expenditures/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const expenditure = await Expenditure.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: PaymentMethod, as: 'paymentMethod' },
        {
          model: StatusHistory,
          as: 'statusHistory',
          order: [['effectiveMonth', 'DESC']],
          limit: 1
        }
      ]
    });

    // 타입별 상세 정보 로드
    let detail = null;
    switch (expenditure?.type) {
      case 'REGULAR':
        detail = await ExpenditureDetailsRegular.findByPk(id);
        break;
      case 'SUBSCRIPTION':
        detail = await ExpenditureDetailsSubscription.findByPk(id);
        break;
      case 'INSTALLMENT':
        detail = await ExpenditureDetailsInstallment.findByPk(id);
        break;
    }

    if (expenditure && detail) {
      expenditure.dataValues.detail = detail;
    }

    if (!expenditure) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '지출을 찾을 수 없습니다' }
      });
    }

    res.json({
      success: true,
      data: expenditure
    });
  } catch (error) {
    console.error('GET /expenditures/:id error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

// PATCH /api/v1/expenditures/:id
router.patch('/expenditures/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, itemName, paymentDay, paymentCycle, memo, paymentMethodId } = req.body;

    // 지출 존재 여부 확인
    const expenditure = await Expenditure.findByPk(id);
    if (!expenditure) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '지출을 찾을 수 없습니다' }
      });
    }

    // 수정할 데이터 구성 (유형 변경 불가)
    const updateData = {};

    if (categoryId !== undefined) {
      // Category 존재 여부 확인
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: '카테고리를 찾을 수 없습니다' }
        });
      }
      updateData.categoryId = categoryId;
    }

    if (itemName !== undefined) {
      if (!itemName || itemName.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '지출명은 필수입니다' }
        });
      }
      updateData.itemName = itemName.trim();
    }

    if (paymentDay !== undefined) {
      if (typeof paymentDay !== 'number' || paymentDay < 1 || paymentDay > 31) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '결제일은 1-31 사이의 숫자여야 합니다' }
        });
      }
      updateData.paymentDay = paymentDay;
    }

    if (paymentCycle !== undefined) {
      updateData.paymentCycle = paymentCycle;
    }

    if (memo !== undefined) {
      updateData.memo = memo?.trim() || null;
    }

    if (paymentMethodId !== undefined) {
      if (paymentMethodId) {
        const paymentMethod = await PaymentMethod.findByPk(paymentMethodId);
        if (!paymentMethod) {
          return res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: '결제 수단을 찾을 수 없습니다' }
          });
        }
      }
      updateData.paymentMethodId = paymentMethodId;
    }

    // 업데이트 수행
    await expenditure.update(updateData);

    // 업데이트된 지출 정보 조회 (관련 정보 포함)
    const updatedExpenditure = await Expenditure.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: PaymentMethod, as: 'paymentMethod' }
      ]
    });

    res.json({
      success: true,
      data: updatedExpenditure,
      message: '지출이 성공적으로 수정되었습니다'
    });
  } catch (error) {
    console.error('PATCH /expenditures/:id error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

// DELETE /api/v1/expenditures/:id
router.delete('/expenditures/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const expenditure = await Expenditure.findByPk(id);
    if (!expenditure) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '지출을 찾을 수 없습니다' }
      });
    }

    await expenditure.destroy();

    res.status(204).send();
  } catch (error) {
    console.error('DELETE /expenditures/:id error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

// PUT /api/v1/expenditures/:id/payments/:month
router.put('/expenditures/:id/payments/:month', async (req, res) => {
  try {
    const { id, month } = req.params;
    const { isPaid, paidTimestamp } = req.body;

    // 월 포맷 검증 (YYYY-MM)
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '월 포맷은 YYYY-MM 형태여야 합니다' }
      });
    }

    // Expenditure 존재 여부 확인
    const expenditure = await Expenditure.findByPk(id);
    if (!expenditure) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '지출을 찾을 수 없습니다' }
      });
    }

    const paymentMonth = new Date(month + '-01');

    // UPSERT 패턴으로 납부 이력 처리
    const [paymentHistory, created] = await PaymentHistory.upsert({
      expenditureId: id,
      paymentMonth,
      isPaid: isPaid ?? true,
      paidTimestamp: isPaid ? (paidTimestamp ? new Date(paidTimestamp) : new Date()) : null
    });

    res.json({ success: true });
  } catch (error) {
    console.error('PUT /expenditures/:id/payments/:month error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

// PUT /api/v1/expenditures/:id/statuses/:effectiveMonth
router.put('/expenditures/:id/statuses/:effectiveMonth', async (req, res) => {
  try {
    const { id, effectiveMonth } = req.params;
    const { status } = req.body;

    // 월 포맷 검증 (YYYY-MM-01)
    const monthRegex = /^\d{4}-\d{2}-01$/;
    if (!monthRegex.test(effectiveMonth)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '효력 발생월 포맷은 YYYY-MM-01 형태여야 합니다' }
      });
    }

    // 상태 검증
    if (!['active', 'paused'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '상태는 active 또는 paused여야 합니다' }
      });
    }

    // Expenditure 존재 여부 확인
    const expenditure = await Expenditure.findByPk(id);
    if (!expenditure) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '지출을 찾을 수 없습니다' }
      });
    }

    const effectiveDate = new Date(effectiveMonth);

    // UPSERT 패턴으로 상태 이력 처리
    const [statusHistory, created] = await StatusHistory.upsert({
      expenditureId: id,
      status,
      effectiveMonth: effectiveDate
    });

    res.json({ success: true });
  } catch (error) {
    console.error('PUT /expenditures/:id/statuses/:effectiveMonth error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

module.exports = router;