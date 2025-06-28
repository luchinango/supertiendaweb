export const categorySchemas = {
  Category: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      description: { type: 'string' },
      parentId: { type: 'integer' },
      isActive: { type: 'boolean' },
      sortOrder: { type: 'integer' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      deletedAt: { type: 'string', format: 'date-time' },
      createdBy: { type: 'integer' },
      updatedBy: { type: 'integer' },
      deletedBy: { type: 'integer' },
      productCount: { type: 'integer' },
      children: {
        type: 'array',
        items: { $ref: '#/components/schemas/Category' }
      },
      parent: { $ref: '#/components/schemas/Category' }
    },
    required: ['id', 'name', 'isActive', 'sortOrder', 'createdAt', 'updatedAt']
  },

  CreateCategoryRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        maxLength: 100,
        description: 'Nombre de la categoría'
      },
      description: {
        type: 'string',
        maxLength: 500,
        description: 'Descripción opcional de la categoría'
      },
      parentId: {
        type: 'integer',
        minimum: 1,
        description: 'ID de la categoría padre (opcional)'
      },
      isActive: {
        type: 'boolean',
        default: true,
        description: 'Estado activo de la categoría'
      },
      sortOrder: {
        type: 'integer',
        minimum: 0,
        default: 0,
        description: 'Orden de clasificación'
      }
    },
    required: ['name']
  },

  UpdateCategoryRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        maxLength: 100,
        description: 'Nombre de la categoría'
      },
      description: {
        type: 'string',
        maxLength: 500,
        description: 'Descripción de la categoría'
      },
      parentId: {
        type: 'integer',
        minimum: 1,
        description: 'ID de la categoría padre'
      },
      isActive: {
        type: 'boolean',
        description: 'Estado activo de la categoría'
      },
      sortOrder: {
        type: 'integer',
        minimum: 0,
        description: 'Orden de clasificación'
      }
    }
  },

  CategoryTreeNode: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      description: { type: 'string' },
      isActive: { type: 'boolean' },
      sortOrder: { type: 'integer' },
      productCount: { type: 'integer' },
      children: {
        type: 'array',
        items: { $ref: '#/components/schemas/CategoryTreeNode' }
      }
    },
    required: ['id', 'name', 'isActive', 'sortOrder', 'productCount', 'children']
  },

  CategoryStats: {
    type: 'object',
    properties: {
      totalCategories: { type: 'integer' },
      activeCategories: { type: 'integer' },
      inactiveCategories: { type: 'integer' },
      categoriesWithProducts: { type: 'integer' },
      averageProductsPerCategory: { type: 'number' },
      topCategoriesByProducts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            productCount: { type: 'integer' }
          },
          required: ['id', 'name', 'productCount']
        }
      }
    },
    required: [
      'totalCategories',
      'activeCategories',
      'inactiveCategories',
      'categoriesWithProducts',
      'averageProductsPerCategory',
      'topCategoriesByProducts'
    ]
  }
};