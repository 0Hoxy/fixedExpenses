const jwt = require('jsonwebtoken');
const { User, Profile } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET 환경변수가 설정되지 않았습니다!');
  process.exit(1);
}

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '액세스 토큰이 필요합니다' }
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      include: [{
        model: Profile,
        as: 'profiles'
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '유효하지 않은 토큰입니다' }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '유효하지 않은 토큰입니다' }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: '토큰이 만료되었습니다' }
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' }
    });
  }
};

const checkProfileOwnership = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const userId = req.user.id;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Profile ID가 필요합니다' }
      });
    }

    const profile = await Profile.findOne({
      where: { id: profileId, userId }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '프로필을 찾을 수 없거나 접근 권한이 없습니다' }
      });
    }

    req.profile = profile;
    next();
  } catch (error) {
    console.error('Profile ownership check error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' }
    });
  }
};

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

module.exports = {
  authenticateToken,
  checkProfileOwnership,
  generateToken
};