import { useCallback } from "react";

const API_BASE = process.env['NEXT_PUBLIC_API_URL'];

export function usePurchaseOrders(token?: string) {
  // Obtener una orden por ID
  const getOrder = useCallback(async (orderId: number | string) => {
    const res = await fetch(`${API_BASE}/purchase-orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    return await res.json();
  }, [token]);

  // Crear una nueva orden
  const createOrder = useCallback(async (body: any) => {
    const res = await fetch(`${API_BASE}/purchase-orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    return await res.json();
  }, [token]);

  // Actualizar una orden existente
  const updateOrder = useCallback(async (orderId: number | string, body: any) => {
    const res = await fetch(`${API_BASE}/purchase-orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    return await res.json();
  }, [token]);

  // Eliminar una orden
  const deleteOrder = useCallback(async (orderId: number | string) => {
    const res = await fetch(`${API_BASE}/purchase-orders/${orderId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    return await res.json();
  }, [token]);

  // Aprobar una orden
  const approveOrder = useCallback(async (orderId: number | string, approvedBy: number) => {
    const res = await fetch(`${API_BASE}/purchase-orders/${orderId}/approve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({ approvedBy }),
    });
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    } else {
      throw new Error("Respuesta no es JSON. Verifica la URL y el backend.");
    }
  }, [token]);

  return {
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    approveOrder,
  };
}

export async function getPurchaseOrder(orderId: number, token: string) {
  const res = await fetch(`${API_BASE}/purchase-orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    }
  });
  return await res.json();
}