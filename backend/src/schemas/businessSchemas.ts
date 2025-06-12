export const businessSchemas = {
  EmployeeBasic: {
    type: 'object',
    properties: {
      id: {type: 'integer'},
      firstName: {type: 'string'},
      lastName: {type: 'string'},
      position: {type: 'string'},
      status: {type: 'string'},
    },
    required: ['id', 'firstName', 'position', 'status']
  },
  FiscalSettingsBasic: {
    type: 'object',
    properties: {
      id: {type: 'integer'},
      authorizationNumber: {type: 'string'},
      activityCode: {type: 'string'},
    },
    required: ['id', 'authorizationNumber', 'activityCode']
  },
  CreateBusinessRequest: {
    type: 'object',
    properties: {
      name: {type: 'string', minLength: 2, maxLength: 100},
      legalName: {type: 'string', maxLength: 150},
      description: {type: 'string'},
      nit: {type: 'string', maxLength: 20},
      businessType: {type: 'string', enum: ['PERSONA_NATURAL', 'PERSONA_JURIDICA']},
      email: {type: 'string', format: 'email', maxLength: 100},
      phone: {type: 'string', maxLength: 20},
      address: {type: 'string'},
      city: {type: 'string', maxLength: 50},
      department: {
        type: 'string',
        enum: ['LA_PAZ', 'COCHABAMBA', 'SANTA_CRUZ', 'ORURO', 'POTOSI', 'TARIJA', 'CHUQUISACA', 'BENI', 'PANDO']
      },
      country: {type: 'string', maxLength: 50},
      postalCode: {type: 'string', maxLength: 10},
      logoUrl: {type: 'string'},
      website: {type: 'string'},
      timezone: {type: 'string', maxLength: 50},
      currency: {type: 'string', enum: ['BOB', 'USD']},
      defaultTaxRate: {type: 'number', minimum: 0, maximum: 100},
      status: {type: 'string', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED']}
    },
    required: ['name']
  },
  UpdateBusinessRequest: {
    type: 'object',
    properties: {
      name: {type: 'string', minLength: 2, maxLength: 100},
      legalName: {type: 'string', maxLength: 150},
      description: {type: 'string'},
      nit: {type: 'string', maxLength: 20},
      businessType: {type: 'string', enum: ['PERSONA_NATURAL', 'PERSONA_JURIDICA']},
      email: {type: 'string', format: 'email', maxLength: 100},
      phone: {type: 'string', maxLength: 20},
      address: {type: 'string'},
      city: {type: 'string', maxLength: 50},
      department: {
        type: 'string',
        enum: ['LA_PAZ', 'COCHABAMBA', 'SANTA_CRUZ', 'ORURO', 'POTOSI', 'TARIJA', 'CHUQUISACA', 'BENI', 'PANDO']
      },
      country: {type: 'string', maxLength: 50},
      postalCode: {type: 'string', maxLength: 10},
      logoUrl: {type: 'string'},
      website: {type: 'string'},
      timezone: {type: 'string', maxLength: 50},
      currency: {type: 'string', enum: ['BOB', 'USD']},
      defaultTaxRate: {type: 'number', minimum: 0, maximum: 100},
      status: {type: 'string', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED']}
    }
  },
  Business: {
    type: 'object',
    properties: {
      id: {type: 'integer'},
      name: {type: 'string'},
      legalName: {type: 'string'},
      description: {type: 'string'},
      nit: {type: 'string'},
      businessType: {type: 'string'},
      email: {type: 'string'},
      phone: {type: 'string'},
      address: {type: 'string'},
      city: {type: 'string'},
      department: {type: 'string'},
      country: {type: 'string'},
      postalCode: {type: 'string'},
      logoUrl: {type: 'string'},
      website: {type: 'string'},
      timezone: {type: 'string'},
      currency: {type: 'string'},
      defaultTaxRate: {type: 'number'},
      status: {type: 'string'},
      createdAt: {type: 'string', format: 'date-time'},
      updatedAt: {type: 'string', format: 'date-time'},
      deletedAt: {type: 'string', format: 'date-time'},
      createdBy: {type: 'integer'},
      updatedBy: {type: 'integer'},
      deletedBy: {type: 'integer'},
      employees: {
        type: 'array',
        items: {$ref: '#/components/schemas/EmployeeBasic'}
      },
      fiscalSettings: {
        $ref: '#/components/schemas/FiscalSettingsBasic'
      }
    },
    required: ['id', 'name', 'status', 'createdAt', 'updatedAt']
  },
  BusinessListResponse: {
    type: 'object',
    properties: {
      businesses: {
        type: 'array',
        items: {$ref: '#/components/schemas/Business'}
      },
      total: {type: 'integer'},
      page: {type: 'integer'},
      totalPages: {type: 'integer'},
      limit: {type: 'integer'}
    },
    required: ['businesses', 'total', 'page', 'totalPages', 'limit']
  }
};