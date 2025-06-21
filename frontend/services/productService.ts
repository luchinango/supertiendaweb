import apiClient from '@/lib/api-client'
import type { AxiosError } from 'axios'

export interface Product {
  id: number
  name: string
  description?: string
  price: number
  stock: number
  categoryId?: number
  businessId: number
  createdAt: string
  updatedAt: string
}

export interface CreateProductRequest {
  name: string
  description?: string
  price: number
  stock: number
  categoryId?: number
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  price?: number
  stock?: number
  categoryId?: number
}

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  limit: number
}

export const productService = {
  getAll: async (page = 1, limit = 10, search?: string): Promise<ProductsResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (search) {
        params.append('search', search)
      }

      const response = await apiClient.get<ProductsResponse>(`/products?${params}`)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      throw new Error(axiosError.response?.data?.message || 'Error al obtener productos')
    }
  },

  getById: async (id: number): Promise<Product> => {
    try {
      const response = await apiClient.get<Product>(`/products/${id}`)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      throw new Error(axiosError.response?.data?.message || 'Error al obtener el producto')
    }
  },

  create: async (productData: CreateProductRequest): Promise<Product> => {
    try {
      const response = await apiClient.post<Product>('/products', productData)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      throw new Error(axiosError.response?.data?.message || 'Error al crear el producto')
    }
  },

  update: async (id: number, productData: UpdateProductRequest): Promise<Product> => {
    try {
      const response = await apiClient.put<Product>(`/products/${id}`, productData)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      throw new Error(axiosError.response?.data?.message || 'Error al actualizar el producto')
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/products/${id}`)
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      throw new Error(axiosError.response?.data?.message || 'Error al eliminar el producto')
    }
  },

  updateStock: async (id: number, stock: number): Promise<Product> => {
    try {
      const response = await apiClient.patch<Product>(`/products/${id}/stock`, { stock })
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      throw new Error(axiosError.response?.data?.message || 'Error al actualizar el stock')
    }
  },
}
