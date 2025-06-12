/**
 * Esquemas Swagger para Gestión de Proveedores
 */

export const supplierSchemas = {
  CreateSupplierRequest: {
    type: 'object',
    properties: {
      code: {type: 'string', example: 'PROV001', maxLength: 50},
      name: {type: 'string', example: 'Distribuidora ABC S.A.', minLength: 2, maxLength: 200},
      documentType: {
        type: 'string',
        enum: ['NIT', 'CI', 'PASSPORT', 'FOREIGN_ID'],
        example: 'NIT'
      },
      documentNumber: {type: 'string', example: '1234567890', maxLength: 20},
      contactPerson: {type: 'string', example: 'Juan Pérez', maxLength: 100},
      email: {type: 'string', format: 'email', example: 'contacto@distribuidora.com', maxLength: 100},
      phone: {type: 'string', example: '+591 70012345', maxLength: 20},
      address: {type: 'string', example: 'Av. Principal 123, Zona Central'},
      city: {type: 'string', example: 'La Paz', maxLength: 50},
      department: {
        type: 'string',
        enum: ['LA_PAZ', 'COCHABAMBA', 'SANTA_CRUZ', 'ORURO', 'POTOSI', 'TARIJA', 'CHUQUISACA', 'BENI', 'PANDO'],
        example: 'LA_PAZ'
      },
      country: {type: 'string', example: 'Bolivia', maxLength: 50},
      postalCode: {type: 'string', example: '0001', maxLength: 10},
      paymentTerms: {type: 'integer', example: 30, minimum: 0, maximum: 365},
      creditLimit: {type: 'number', example: 50000.00, minimum: 0},
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
        example: 'ACTIVE'
      },
      notes: {type: 'string', example: 'Proveedor confiable con buen historial de pagos'}
    },
    required: ['name']
  },

  UpdateSupplierRequest: {
    type: 'object',
    properties: {
      code: {type: 'string', example: 'PROV001', maxLength: 50},
      name: {type: 'string', example: 'Distribuidora ABC S.A.', minLength: 2, maxLength: 200},
      documentType: {
        type: 'string',
        enum: ['NIT', 'CI', 'PASSPORT', 'FOREIGN_ID'],
        example: 'NIT'
      },
      documentNumber: {type: 'string', example: '1234567890', maxLength: 20},
      contactPerson: {type: 'string', example: 'Juan Pérez', maxLength: 100},
      email: {type: 'string', format: 'email', example: 'contacto@distribuidora.com', maxLength: 100},
      phone: {type: 'string', example: '+591 70012345', maxLength: 20},
      address: {type: 'string', example: 'Av. Principal 123, Zona Central'},
      city: {type: 'string', example: 'La Paz', maxLength: 50},
      department: {
        type: 'string',
        enum: ['LA_PAZ', 'COCHABAMBA', 'SANTA_CRUZ', 'ORURO', 'POTOSI', 'TARIJA', 'CHUQUISACA', 'BENI', 'PANDO'],
        example: 'LA_PAZ'
      },
      country: {type: 'string', example: 'Bolivia', maxLength: 50},
      postalCode: {type: 'string', example: '0001', maxLength: 10},
      paymentTerms: {type: 'integer', example: 30, minimum: 0, maximum: 365},
      creditLimit: {type: 'number', example: 50000.00, minimum: 0},
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
        example: 'ACTIVE'
      },
      notes: {type: 'string', example: 'Proveedor confiable con buen historial de pagos'}
    }
  },

  SupplierResponse: {
    type: 'object',
    properties: {
      id: {type: 'integer', example: 1},
      businessId: {type: 'integer', example: 1},
      code: {type: 'string', example: 'PROV001'},
      name: {type: 'string', example: 'Distribuidora ABC S.A.'},
      documentType: {
        type: 'string',
        enum: ['NIT', 'CI', 'PASSPORT', 'FOREIGN_ID'],
        example: 'NIT'
      },
      documentNumber: {type: 'string', example: '1234567890'},
      contactPerson: {type: 'string', example: 'Juan Pérez'},
      email: {type: 'string', example: 'contacto@distribuidora.com'},
      phone: {type: 'string', example: '+591 70012345'},
      address: {type: 'string', example: 'Av. Principal 123, Zona Central'},
      city: {type: 'string', example: 'La Paz'},
      department: {
        type: 'string',
        enum: ['LA_PAZ', 'COCHABAMBA', 'SANTA_CRUZ', 'ORURO', 'POTOSI', 'TARIJA', 'CHUQUISACA', 'BENI', 'PANDO'],
        example: 'LA_PAZ'
      },
      country: {type: 'string', example: 'Bolivia'},
      postalCode: {type: 'string', example: '0001'},
      paymentTerms: {type: 'integer', example: 30},
      creditLimit: {type: 'number', example: 50000.00},
      currentBalance: {type: 'number', example: 15000.00},
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
        example: 'ACTIVE'
      },
      notes: {type: 'string', example: 'Proveedor confiable con buen historial de pagos'},
      createdAt: {type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z'},
      updatedAt: {type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z'},
      deletedAt: {type: 'string', format: 'date-time', nullable: true},
      createdBy: {type: 'integer', example: 1},
      updatedBy: {type: 'integer', example: 1},
      deletedBy: {type: 'integer', nullable: true},
      business: {
        type: 'object',
        properties: {
          id: {type: 'integer', example: 1},
          name: {type: 'string', example: 'Mi Empresa'}
        }
      },
      purchaseOrders: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {type: 'integer', example: 1},
            poNumber: {type: 'string', example: 'PO-2024-001'},
            status: {type: 'string', example: 'PENDING'},
            totalAmount: {type: 'number', example: 25000.00}
          }
        }
      },
      supplierDebts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {type: 'integer', example: 1},
            amount: {type: 'number', example: 15000.00},
            paidAmount: {type: 'number', example: 5000.00},
            dueDate: {type: 'string', format: 'date-time', example: '2024-02-15T00:00:00Z'},
            isPaid: {type: 'boolean', example: false}
          }
        }
      }
    },
    required: ['id', 'businessId', 'name', 'documentType', 'paymentTerms', 'currentBalance', 'status', 'createdAt', 'updatedAt']
  },

  SupplierListResponse: {
    type: 'object',
    properties: {
      suppliers: {
        type: 'array',
        items: {$ref: '#/components/schemas/SupplierResponse'}
      },
      total: {type: 'integer', example: 25},
      page: {type: 'integer', example: 1},
      totalPages: {type: 'integer', example: 3},
      limit: {type: 'integer', example: 10}
    },
    required: ['suppliers', 'total', 'page', 'totalPages', 'limit']
  },

  SupplierStats: {
    type: 'object',
    properties: {
      totalSuppliers: {type: 'integer', example: 25},
      activeSuppliers: {type: 'integer', example: 20},
      inactiveSuppliers: {type: 'integer', example: 5},
      totalCreditLimit: {type: 'number', example: 1250000.00},
      totalCurrentBalance: {type: 'number', example: 250000.00},
      suppliersWithDebt: {type: 'integer', example: 8},
      averagePaymentTerms: {type: 'number', example: 30}
    },
    required: ['totalSuppliers', 'activeSuppliers', 'inactiveSuppliers', 'totalCreditLimit', 'totalCurrentBalance', 'suppliersWithDebt', 'averagePaymentTerms']
  },

  SupplierSearchResult: {
    type: 'object',
    properties: {
      id: {type: 'integer', example: 1},
      name: {type: 'string', example: 'Distribuidora ABC S.A.'},
      code: {type: 'string', example: 'PROV001'},
      documentNumber: {type: 'string', example: '1234567890'},
      phone: {type: 'string', example: '+591 70012345'},
      email: {type: 'string', example: 'contacto@distribuidora.com'},
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
        example: 'ACTIVE'
      },
      currentBalance: {type: 'number', example: 15000.00}
    },
    required: ['id', 'name', 'status', 'currentBalance']
  }
};

