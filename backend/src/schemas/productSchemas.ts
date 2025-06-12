export const productSchemas = {
  ProductCategoryBasic: {
    type: 'object',
    properties: {
      id: {type: 'integer'},
      name: {type: 'string'},
      description: {type: 'string'},
      isActive: {type: 'boolean'}
    },
    required: ['id', 'name']
  },
  Product: {
    type: 'object',
    properties: {
      id: {type: 'integer'},
      name: {type: 'string'},
      sku: {type: 'string'},
      barcode: {type: 'string'},
      brand: {type: 'string'},
      model: {type: 'string'},
      unit: {type: 'string'},
      weight: {type: 'number'},
      dimensions: {type: 'string'},
      costPrice: {type: 'number'},
      sellingPrice: {type: 'number'},
      taxType: {type: 'string'},
      taxRate: {type: 'number'},
      minStock: {type: 'integer'},
      maxStock: {type: 'integer'},
      reorderPoint: {type: 'integer'},
      isActive: {type: 'boolean'},
      status: {type: 'string'},
      expiryDate: {type: 'string', format: 'date-time'},
      createdAt: {type: 'string', format: 'date-time'},
      updatedAt: {type: 'string', format: 'date-time'},
      deletedAt: {type: 'string', format: 'date-time'},
      createdBy: {type: 'integer'},
      updatedBy: {type: 'integer'},
      deletedBy: {type: 'integer'},
      description: {type: 'string'},
      category: {$ref: '#/components/schemas/ProductCategoryBasic'}
    },
    required: ['id', 'name', 'sellingPrice', 'status', 'createdAt', 'updatedAt', 'category']
  },
  CreateProductRequest: {
    type: 'object',
    properties: {
      name: {type: 'string', minLength: 2, maxLength: 200},
      sku: {type: 'string', maxLength: 50},
      barcode: {type: 'string', maxLength: 50},
      brand: {type: 'string', maxLength: 100},
      model: {type: 'string', maxLength: 100},
      unit: {type: 'string', maxLength: 20},
      weight: {type: 'number'},
      dimensions: {type: 'string', maxLength: 50},
      costPrice: {type: 'number', minimum: 0},
      sellingPrice: {type: 'number', minimum: 0},
      taxType: {type: 'string'},
      taxRate: {type: 'number', minimum: 0, maximum: 100},
      minStock: {type: 'integer', minimum: 0},
      maxStock: {type: 'integer', minimum: 0},
      reorderPoint: {type: 'integer', minimum: 0},
      expiryDate: {type: 'string', format: 'date-time'},
      status: {type: 'string'},
      categoryId: {type: 'integer'},
      description: {type: 'string'}
    },
    required: ['name', 'sellingPrice', 'categoryId']
  },
  UpdateProductRequest: {
    type: 'object',
    properties: {
      name: {type: 'string', minLength: 2, maxLength: 200},
      sku: {type: 'string', maxLength: 50},
      barcode: {type: 'string', maxLength: 50},
      brand: {type: 'string', maxLength: 100},
      model: {type: 'string', maxLength: 100},
      unit: {type: 'string', maxLength: 20},
      weight: {type: 'number'},
      dimensions: {type: 'string', maxLength: 50},
      costPrice: {type: 'number', minimum: 0},
      sellingPrice: {type: 'number', minimum: 0},
      taxType: {type: 'string'},
      taxRate: {type: 'number', minimum: 0, maximum: 100},
      minStock: {type: 'integer', minimum: 0},
      maxStock: {type: 'integer', minimum: 0},
      reorderPoint: {type: 'integer', minimum: 0},
      expiryDate: {type: 'string', format: 'date-time'},
      status: {type: 'string'},
      categoryId: {type: 'integer'},
      description: {type: 'string'}
    }
  },
  ProductListResponse: {
    type: 'object',
    properties: {
      products: {
        type: 'array',
        items: {$ref: '#/components/schemas/Product'}
      },
      total: {type: 'integer'},
      page: {type: 'integer'},
      totalPages: {type: 'integer'},
      limit: {type: 'integer'}
    },
    required: ['products', 'total', 'page', 'totalPages', 'limit']
  }
};
