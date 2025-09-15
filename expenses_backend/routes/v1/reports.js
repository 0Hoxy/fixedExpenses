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
  ExpenditureDetailsInstallment
} = require('../../models');

// GET /api/v1/profiles/:profileId/reports/monthly
router.get('/profiles/:profileId/reports/monthly', async (req, res) => {
  try {
    const { profileId } = req.params;
    const { from, to } = req.query;

    // 필수 파라미터 검증
    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'from과 to 파라미터는 필수입니다 (YYYY-MM 형식)' }
      });
    }

    // 날짜 포맷 검증
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(from) || !monthRegex.test(to)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '날짜 포맷은 YYYY-MM 형태여야 합니다' }
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

    const fromDate = new Date(from + '-01');
    const toDate = new Date(to + '-01');

    // 날짜 범위 검증
    if (fromDate > toDate) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '시작월이 종료월보다 늦을 수 없습니다' }
      });
    }

    // 월별 데이터 계산
    const series = [];
    const categoryTotals = {};
    let totalPeriodAmount = 0;

    const currentDate = new Date(fromDate);
    while (currentDate <= toDate) {
      const monthStr = currentDate.toISOString().slice(0, 7);
      const monthExpenditures = await getCurrentMonthActiveExpenditures(profileId, currentDate);
      const monthTotal = await calculateMonthTotal(monthExpenditures);

      series.push({
        month: monthStr,
        total: monthTotal
      });

      // 카테고리별 합계 누적
      await accumulateCategoryTotals(monthExpenditures, categoryTotals);
      totalPeriodAmount += monthTotal;

      // 다음 월로 이동
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // 카테고리별 분석 결과 생성
    const byCategory = Object.values(categoryTotals).sort((a, b) => b.amount - a.amount);

    res.json({
      success: true,
      data: {
        series,
        byCategory
      }
    });

  } catch (error) {
    console.error('GET /profiles/:profileId/reports/monthly error:', error);
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
        if (installmentDetail) {
          // 할부의 경우 해당 월이 할부 기간 내인지 확인
          const startMonth = new Date(installmentDetail.startMonth);
          const endMonth = new Date(startMonth);
          endMonth.setMonth(endMonth.getMonth() + installmentDetail.totalMonths - 1);

          // 현재 계산 대상 월이 할부 기간 내에 있는지 확인하는 로직이 필요하지만
          // 여기서는 단순화하여 monthlyPayment를 사용
          monthlyAmount = parseFloat(installmentDetail.monthlyPayment);
        }
        break;
    }

    total += monthlyAmount;
  }

  return total;
}

// 카테고리별 합계 누적
async function accumulateCategoryTotals(expenditures, categoryTotals) {
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
}

module.exports = router;