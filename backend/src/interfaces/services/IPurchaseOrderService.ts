import {
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  PurchaseOrderResponse
} from '../../services/purchaseOrderService';

export interface IPurchaseOrderService {
  create(data: CreatePurchaseOrderRequest): Promise<PurchaseOrderResponse>;
  update(
    id: number,
    data: UpdatePurchaseOrderRequest,
    businessId: number
  ): Promise<PurchaseOrderResponse>;
  findById(id: number, businessId: number): Promise<PurchaseOrderResponse | null>;
  findMany(
    paginationParams: any,
    additionalFilters?: any
  ): Promise<{ data: PurchaseOrderResponse[], meta: any }>;
  delete(id: number, businessId: number): Promise<void>;
  approvePurchaseOrder(
    id: number,
    approvedBy: number,
    businessId: number
  ): Promise<PurchaseOrderResponse>;
}
