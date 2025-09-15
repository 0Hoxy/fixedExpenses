const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: '고정지출 관리 어플리케이션 API',
    version: '1.0.0',
    description: '정기/구독/할부 지출을 포함한 고정지출을 관리하기 위한 REST API입니다.',
    contact: {
      name: '고객 지원',
      email: 'hoxydev9@gmail.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: '개발 서버'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          name: { type: 'string', example: '홍길동' },
          isVerified: { type: 'boolean', example: false },
          lastLoginAt: { type: 'string', format: 'date-time', nullable: true }
        }
      },
      Profile: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 1 },
          name: { type: 'string', example: '기본 프로필' },
          currencyCode: { type: 'string', example: 'KRW' }
        }
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          profileId: { type: 'integer', example: 1 },
          name: { type: 'string', example: '식비' },
          icon: { type: 'string', example: '🍽️', nullable: true },
          color: { type: 'string', example: '#FF6B6B', nullable: true },
          isDefault: { type: 'boolean', example: false }
        }
      },
      Expenditure: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          profileId: { type: 'integer', example: 1 },
          categoryId: { type: 'integer', example: 1 },
          paymentMethodId: { type: 'integer', example: 1, nullable: true },
          itemName: { type: 'string', example: '넷플릭스 구독' },
          paymentDay: { type: 'integer', minimum: 1, maximum: 31, example: 15 },
          paymentCycle: { type: 'string', example: 'MONTHLY' },
          type: { type: 'string', enum: ['REGULAR', 'SUBSCRIPTION', 'INSTALLMENT'], example: 'SUBSCRIPTION' },
          memo: { type: 'string', nullable: true, example: '프리미엄 요금제' }
        }
      },
      ExpenditureDetailsRegular: {
        type: 'object',
        properties: {
          expenditureId: { type: 'integer', example: 1 },
          amount: { type: 'number', format: 'decimal', example: 50000 },
          isShared: { type: 'boolean', example: false },
          totalAmount: { type: 'number', format: 'decimal', nullable: true, example: 100000 },
          shareType: { type: 'string', enum: ['percent', 'fixed'], nullable: true, example: 'percent' }
        }
      },
      ExpenditureDetailsSubscription: {
        type: 'object',
        properties: {
          expenditureId: { type: 'integer', example: 1 },
          amount: { type: 'number', format: 'decimal', example: 15000 },
          planName: { type: 'string', nullable: true, example: '프리미엄' },
          reminderDaysBefore: { type: 'integer', example: 3 }
        }
      },
      ExpenditureDetailsInstallment: {
        type: 'object',
        properties: {
          expenditureId: { type: 'integer', example: 1 },
          principalAmount: { type: 'number', format: 'decimal', example: 1000000 },
          monthlyPayment: { type: 'number', format: 'decimal', example: 100000 },
          startMonth: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' },
          totalMonths: { type: 'integer', minimum: 1, example: 12 },
          interestType: { type: 'string', enum: ['none', 'percent', 'fixed'], example: 'percent' },
          interestValue: { type: 'number', format: 'decimal', nullable: true, example: 5.5 }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
              profiles: { type: 'array', items: { $ref: '#/components/schemas/Profile' } },
              token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
            }
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: '입력 데이터가 유효하지 않습니다' },
              details: { type: 'array', items: { type: 'object' } }
            }
          }
        },
        example: {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다', details: [] }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' }
        },
        example: { success: true, data: {} }
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'array', items: { type: 'object' } },
          pagination: {
            type: 'object',
            properties: {
              currentPage: { type: 'integer', example: 1 },
              totalPages: { type: 'integer', example: 5 },
              totalCount: { type: 'integer', example: 50 },
              limit: { type: 'integer', example: 20 },
              hasNext: { type: 'boolean', example: true },
              hasPrev: { type: 'boolean', example: false }
            }
          }
        }
      }
    }
  }
};

const options = {
  definition: swaggerDefinition,
  apis: ['./routes/v1/*.js'], // paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;