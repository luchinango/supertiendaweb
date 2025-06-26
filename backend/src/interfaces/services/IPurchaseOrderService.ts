import {
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  PurchaseOrderResponse
} from '../../services/purchaseOrderService';
import { PurchaseOrderStatus } from '../../../prisma/generated';

export interface IPurchaseOrderService {
  create(data: CreatePurchaseOrderRequest): Promise<PurchaseOrderResponse>;
  update(id: number, data: UpdatePurchaseOrderRequest): Promise<PurchaseOrderResponse>;
  findById(id: number): Promise<PurchaseOrderResponse | null>;
  findMany(
    paginationParams: any,
    additionalFilters?: any
  ): Promise<{ data: PurchaseOrderResponse[], meta: any }>;
  delete(id: number): Promise<void>;
  approvePurchaseOrder(id: number, approvedBy: number): Promise<PurchaseOrderResponse>;
}
