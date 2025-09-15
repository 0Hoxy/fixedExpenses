const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const {
  Profile,
  Category,
  PaymentMethod,
  Expenditure,
  ExpenditureDetailsRegular,
  ExpenditureDetailsSubscription,
  ExpenditureDetailsInstallment,
  PaymentHistory,
  StatusHistory,
  Photo,
  sequelize
} = require('../../models');

/**
 * @openapi
 * tags:
 *   - name: Backups
 *     description: 백업/복원 API
 */

// Multer 설정 (파일 업로드용)
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB 제한
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json') {
      cb(null, true);
    } else {
      cb(new Error('JSON 파일만 업로드 가능합니다'), false);
    }
  }
});

// 백업 작업 상태 관리 (간단한 메모리 저장소)
const backupJobs = new Map();
const restoreJobs = new Map();

/**
 * @openapi
 * /backups:
 *   post:
 *     tags: [Backups]
 *     summary: 백업 작업 시작
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       202:
 *         description: 작업 접수됨
 */
// POST /api/v1/backups - 백업 파일 생성
router.post('/backups', async (req, res) => {
  try {
    const jobId = generateJobId();

    // 백업 작업 시작
    backupJobs.set(jobId, {
      status: 'processing',
      createdAt: new Date(),
      progress: 0
    });

    // 비동기로 백업 작업 실행
    performBackup(jobId).catch(error => {
      console.error('Backup error:', error);
      backupJobs.set(jobId, {
        ...backupJobs.get(jobId),
        status: 'failed',
        error: error.message
      });
    });

    res.status(202).json({
      success: true,
      data: { jobId },
      message: '백업 작업이 시작되었습니다'
    });

  } catch (error) {
    console.error('POST /backups error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

/**
 * @openapi
 * /backups/{jobId}:
 *   get:
 *     tags: [Backups]
 *     summary: 백업 작업 상태 조회
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 조회 성공
 *       404:
 *         description: 작업 없음
 */
// GET /api/v1/backups/:jobId - 백업 진행 상태/결과 조회
router.get('/backups/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = backupJobs.get(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '백업 작업을 찾을 수 없습니다' }
      });
    }

    const response = {
      success: true,
      data: {
        jobId,
        status: job.status,
        progress: job.progress,
        createdAt: job.createdAt
      }
    };

    if (job.status === 'completed' && job.downloadUrl) {
      response.data.downloadUrl = job.downloadUrl;
    }

    if (job.status === 'failed' && job.error) {
      response.data.error = job.error;
    }

    res.json(response);

  } catch (error) {
    console.error('GET /backups/:jobId error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

/**
 * @openapi
 * /restores:
 *   post:
 *     tags: [Backups]
 *     summary: 백업 파일로 복원 시작
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               backupFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       202:
 *         description: 작업 접수됨
 *       400:
 *         description: 파일 누락
 */
// POST /api/v1/restores - 백업 파일로 복원
router.post('/restores', upload.single('backupFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '백업 파일이 필요합니다' }
      });
    }

    const jobId = generateJobId();

    // 복원 작업 시작
    restoreJobs.set(jobId, {
      status: 'processing',
      createdAt: new Date(),
      progress: 0
    });

    // 비동기로 복원 작업 실행
    performRestore(jobId, req.file.path).catch(error => {
      console.error('Restore error:', error);
      restoreJobs.set(jobId, {
        ...restoreJobs.get(jobId),
        status: 'failed',
        error: error.message
      });
    });

    res.status(202).json({
      success: true,
      data: { jobId },
      message: '복원 작업이 시작되었습니다'
    });

  } catch (error) {
    console.error('POST /restores error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

/**
 * @openapi
 * /restores/{jobId}:
 *   get:
 *     tags: [Backups]
 *     summary: 복원 작업 상태 조회
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 조회 성공
 *       404:
 *         description: 작업 없음
 */
// GET /api/v1/restores/:jobId - 복원 진행 상태 조회
router.get('/restores/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = restoreJobs.get(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '복원 작업을 찾을 수 없습니다' }
      });
    }

    const response = {
      success: true,
      data: {
        jobId,
        status: job.status,
        progress: job.progress,
        createdAt: job.createdAt
      }
    };

    if (job.status === 'failed' && job.error) {
      response.data.error = job.error;
    }

    res.json(response);

  } catch (error) {
    console.error('GET /restores/:jobId error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

// 백업 작업 실행
async function performBackup(jobId) {
  try {
    const job = backupJobs.get(jobId);

    // 진행률 업데이트
    const updateProgress = (progress) => {
      backupJobs.set(jobId, { ...job, progress });
    };

    updateProgress(10);

    // 모든 테이블 데이터 추출
    const backupData = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      data: {}
    };

    updateProgress(20);

    // 각 테이블별로 데이터 추출
    backupData.data.profiles = await Profile.findAll({ raw: true });
    updateProgress(30);

    backupData.data.categories = await Category.findAll({ raw: true });
    updateProgress(40);

    backupData.data.paymentMethods = await PaymentMethod.findAll({ raw: true });
    updateProgress(50);

    backupData.data.expenditures = await Expenditure.findAll({ raw: true });
    updateProgress(60);

    backupData.data.expenditureDetailsRegular = await ExpenditureDetailsRegular.findAll({ raw: true });
    backupData.data.expenditureDetailsSubscription = await ExpenditureDetailsSubscription.findAll({ raw: true });
    backupData.data.expenditureDetailsInstallment = await ExpenditureDetailsInstallment.findAll({ raw: true });
    updateProgress(70);

    backupData.data.paymentHistory = await PaymentHistory.findAll({ raw: true });
    backupData.data.statusHistory = await StatusHistory.findAll({ raw: true });
    updateProgress(80);

    backupData.data.photos = await Photo.findAll({ raw: true });
    updateProgress(90);

    // 백업 파일 생성
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.json`;
    const filepath = path.join('uploads', filename);

    await fs.writeFile(filepath, JSON.stringify(backupData, null, 2), 'utf8');

    updateProgress(100);

    // 작업 완료
    backupJobs.set(jobId, {
      ...job,
      status: 'completed',
      progress: 100,
      downloadUrl: `/api/v1/downloads/${filename}`,
      filename
    });

  } catch (error) {
    throw error;
  }
}

// 복원 작업 실행
async function performRestore(jobId, backupFilePath) {
  const transaction = await sequelize.transaction();

  try {
    const job = restoreJobs.get(jobId);

    // 진행률 업데이트
    const updateProgress = (progress) => {
      restoreJobs.set(jobId, { ...job, progress });
    };

    updateProgress(10);

    // 백업 파일 읽기
    const backupContent = await fs.readFile(backupFilePath, 'utf8');
    const backupData = JSON.parse(backupContent);

    updateProgress(20);

    // 데이터 검증
    if (!backupData.data) {
      throw new Error('올바르지 않은 백업 파일 형식입니다');
    }

    // 기존 데이터 삭제 (역순으로)
    updateProgress(30);
    await Photo.destroy({ where: {}, transaction });
    await StatusHistory.destroy({ where: {}, transaction });
    await PaymentHistory.destroy({ where: {}, transaction });

    updateProgress(40);
    await ExpenditureDetailsInstallment.destroy({ where: {}, transaction });
    await ExpenditureDetailsSubscription.destroy({ where: {}, transaction });
    await ExpenditureDetailsRegular.destroy({ where: {}, transaction });

    updateProgress(50);
    await Expenditure.destroy({ where: {}, transaction });
    await PaymentMethod.destroy({ where: {}, transaction });
    await Category.destroy({ where: {}, transaction });
    await Profile.destroy({ where: {}, transaction });

    // 데이터 복원 (순서대로)
    updateProgress(60);
    if (backupData.data.profiles) {
      await Profile.bulkCreate(backupData.data.profiles, { transaction });
    }

    updateProgress(65);
    if (backupData.data.categories) {
      await Category.bulkCreate(backupData.data.categories, { transaction });
    }

    if (backupData.data.paymentMethods) {
      await PaymentMethod.bulkCreate(backupData.data.paymentMethods, { transaction });
    }

    updateProgress(70);
    if (backupData.data.expenditures) {
      await Expenditure.bulkCreate(backupData.data.expenditures, { transaction });
    }

    updateProgress(80);
    if (backupData.data.expenditureDetailsRegular) {
      await ExpenditureDetailsRegular.bulkCreate(backupData.data.expenditureDetailsRegular, { transaction });
    }
    if (backupData.data.expenditureDetailsSubscription) {
      await ExpenditureDetailsSubscription.bulkCreate(backupData.data.expenditureDetailsSubscription, { transaction });
    }
    if (backupData.data.expenditureDetailsInstallment) {
      await ExpenditureDetailsInstallment.bulkCreate(backupData.data.expenditureDetailsInstallment, { transaction });
    }

    updateProgress(90);
    if (backupData.data.paymentHistory) {
      await PaymentHistory.bulkCreate(backupData.data.paymentHistory, { transaction });
    }
    if (backupData.data.statusHistory) {
      await StatusHistory.bulkCreate(backupData.data.statusHistory, { transaction });
    }

    updateProgress(95);
    if (backupData.data.photos) {
      await Photo.bulkCreate(backupData.data.photos, { transaction });
    }

    await transaction.commit();
    updateProgress(100);

    // 작업 완료
    restoreJobs.set(jobId, {
      ...job,
      status: 'completed',
      progress: 100
    });

    // 임시 파일 삭제
    await fs.unlink(backupFilePath).catch(console.error);

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * @openapi
 * /downloads/{filename}:
 *   get:
 *     tags: [Backups]
 *     summary: 백업 파일 다운로드
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 파일 다운로드
 *       404:
 *         description: 파일 없음
 */
// 다운로드 엔드포인트
router.get('/downloads/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join('uploads', filename);

    // 파일 존재 여부 확인
    await fs.access(filepath);

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: '파일을 찾을 수 없습니다' }
          });
        }
      }
    });

  } catch (error) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: '파일을 찾을 수 없습니다' }
    });
  }
});

// 유틸리티 함수
function generateJobId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

module.exports = router;