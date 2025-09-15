const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const {
  Expenditure,
  Profile,
  Category,
  StatusHistory,
  ExpenditureDetailsRegular,
  ExpenditureDetailsSubscription,
  ExpenditureDetailsInstallment,
  PaymentHistory
} = require('../../models');

/**
 * @openapi
 * tags:
 *   - name: Dashboard
 *     description: 대시보드/집계 API
 */

/**
 * @openapi
 * /profiles/{profileId}/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: 대시보드 데이터 조회
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           example: '2025-09'
 *     responses:
 *       200:
 *         description: 조회 성공
 */
// GET /api/v1/profiles/:profileId/dashboard
router.get('/profiles/:profileId/dashboard', async (req, res) => {
  try {
    const { profileId } = req.params;
    const month = req.query.month || new Date().toISOString().slice(0, 7); // YYYY-MM

    // Profile 존재 여부 확인
    const profile = await Profile.findByPk(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '프로필을 찾을 수 없습니다' }
      });
    }

    const currentMonth = new Date(month + '-01');
    const lastMonth = new Date(currentMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // 현재 월 active 지출 항목들 조회
    const currentMonthExpenditures = await getCurrentMonthActiveExpenditures(profileId, currentMonth);
    const lastMonthExpenditures = await getCurrentMonthActiveExpenditures(profileId, lastMonth);

    // 월별 총액 계산
    const monthTotal = await calculateMonthTotal(currentMonthExpenditures);
    const lastMonthTotal = await calculateMonthTotal(lastMonthExpenditures);

    // 증감 메시지 생성
    const delta = monthTotal - lastMonthTotal;
    let deltaMessage = '';
    if (delta > 0) {
      deltaMessage = `+${delta.toLocaleString()}원 증가`;
    } else if (delta < 0) {
      deltaMessage = `${Math.abs(delta).toLocaleString()}원 감소`;
    } else {
      deltaMessage = '변화 없음';
    }

    // 다가오는 결제 건 조회
    const today = new Date();
    const upcomingPayment = await getUpcomingPayment(currentMonthExpenditures, today);

    // 카테고리별 지출 분석
    const byCategory = await getCategoryAnalysis(currentMonthExpenditures, monthTotal);

    res.json({
      success: true,
      data: {
        monthTotal,
        lastMonthTotal,
        deltaMessage,
        upcoming: upcomingPayment,
        byCategory
      }
    });

  } catch (error) {
    console.error('GET /profiles/:profileId/dashboard error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

// 현재 월 active 지출 항목들 조회
async function getCurrentMonthActiveExpenditures(profileId, targetMonth) {
  return await Expenditure.findAll({
    where: { profileId },
    include: [
      {
        model: StatusHistory,
        as: 'statusHistory',
        where: {
          effectiveMonth: {
            [Op.lte]: targetMonth
          },
          status: 'active'
        },
        order: [['effectiveMonth', 'DESC']],
        limit: 1,
        required: true
      },
      {
        model: Category,
        as: 'category'
      }
    ]
  });
}

// 월별 총액 계산
async function calculateMonthTotal(expenditures) {
  let total = 0;

  for (const expenditure of expenditures) {
    let monthlyAmount = 0;

    switch (expenditure.type) {
      case 'REGULAR':
        const regularDetail = await ExpenditureDetailsRegular.findByPk(expenditure.id);
        monthlyAmount = regularDetail ? parseFloat(regularDetail.amount) : 0;
        break;

      case 'SUBSCRIPTION':
        const subscriptionDetail = await ExpenditureDetailsSubscription.findByPk(expenditure.id);
        monthlyAmount = subscriptionDetail ? parseFloat(subscriptionDetail.amount) : 0;
        break;

      case 'INSTALLMENT':
        const installmentDetail = await ExpenditureDetailsInstallment.findByPk(expenditure.id);
        monthlyAmount = installmentDetail ? parseFloat(installmentDetail.monthlyPayment) : 0;
        break;
    }

    total += monthlyAmount;
  }

  return total;
}

// 다가오는 결제 건 조회
async function getUpcomingPayment(expenditures, today) {
  const currentDay = today.getDate();
  let upcomingPayment = null;
  let minDaysUntilPayment = Infinity;

  for (const expenditure of expenditures) {
    const paymentDay = expenditure.paymentDay;
    let daysUntilPayment;

    if (paymentDay >= currentDay) {
      // 이번 달 결제
      daysUntilPayment = paymentDay - currentDay;
    } else {
      // 다음 달 결제
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1, paymentDay);
      daysUntilPayment = Math.ceil((nextMonth - today) / (1000 * 60 * 60 * 24));
    }

    if (daysUntilPayment < minDaysUntilPayment) {
      minDaysUntilPayment = daysUntilPayment;

      // 해당 지출의 월 납부액 조회
      let amount = 0;
      switch (expenditure.type) {
        case 'REGULAR':
          const regularDetail = await ExpenditureDetailsRegular.findByPk(expenditure.id);
          amount = regularDetail ? parseFloat(regularDetail.amount) : 0;
          break;
        case 'SUBSCRIPTION':
          const subscriptionDetail = await ExpenditureDetailsSubscription.findByPk(expenditure.id);
          amount = subscriptionDetail ? parseFloat(subscriptionDetail.amount) : 0;
          break;
        case 'INSTALLMENT':
          const installmentDetail = await ExpenditureDetailsInstallment.findByPk(expenditure.id);
          amount = installmentDetail ? parseFloat(installmentDetail.monthlyPayment) : 0;
          break;
      }

      const dueDate = paymentDay >= currentDay
        ? new Date(today.getFullYear(), today.getMonth(), paymentDay)
        : new Date(today.getFullYear(), today.getMonth() + 1, paymentDay);

      upcomingPayment = {
        expenditureId: expenditure.id,
        itemName: expenditure.itemName,
        dueDate: dueDate.toISOString().split('T')[0],
        amount
      };
    }
  }

  return upcomingPayment;
}

// 카테고리별 지출 분석
async function getCategoryAnalysis(expenditures, monthTotal) {
  const categoryTotals = {};

  for (const expenditure of expenditures) {
    const categoryId = expenditure.categoryId;
    const categoryName = expenditure.category.name;

    let monthlyAmount = 0;
    switch (expenditure.type) {
      case 'REGULAR':
        const regularDetail = await ExpenditureDetailsRegular.findByPk(expenditure.id);
        monthlyAmount = regularDetail ? parseFloat(regularDetail.amount) : 0;
        break;
      case 'SUBSCRIPTION':
        const subscriptionDetail = await ExpenditureDetailsSubscription.findByPk(expenditure.id);
        monthlyAmount = subscriptionDetail ? parseFloat(subscriptionDetail.amount) : 0;
        break;
      case 'INSTALLMENT':
        const installmentDetail = await ExpenditureDetailsInstallment.findByPk(expenditure.id);
        monthlyAmount = installmentDetail ? parseFloat(installmentDetail.monthlyPayment) : 0;
        break;
    }

    if (!categoryTotals[categoryId]) {
      categoryTotals[categoryId] = {
        categoryId,
        name: categoryName,
        amount: 0
      };
    }

    categoryTotals[categoryId].amount += monthlyAmount;
  }

  // 비율 계산 및 정렬
  const result = Object.values(categoryTotals).map(category => ({
    ...category,
    ratio: monthTotal > 0 ? category.amount / monthTotal : 0
  }));

  return result.sort((a, b) => b.amount - a.amount);
}

module.exports = router;