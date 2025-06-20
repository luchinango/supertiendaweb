"use client"

import { createContext, useContext, useState, type ReactNode } from "react";
import { openCashRegister as openCashRegisterService } from "@/services/cashRegisterService";

interface CashRegisterContextType {
  registerStatus: "closed" | "open";
  openCashRegisterForm: () => void;
  closeCashRegisterForm: () => void;
  // Función que llama al endpoint para abrir caja
  openCashRegister: (initialAmount: number, userId: number) => Promise<void>;
  isOpenFormVisible: boolean;
}

const CashRegisterContext = createContext<CashRegisterContextType | undefined>(undefined);

export function CashRegisterProvider({ children }: { children: ReactNode }) {
  const [registerStatus, setRegisterStatus] = useState<"closed" | "open">("closed");
  const [isOpenFormVisible, setIsOpenFormVisible] = useState(false);

  const openCashRegisterForm = () => setIsOpenFormVisible(true);
  const closeCashRegisterForm = () => setIsOpenFormVisible(false);

  async function openCashRegister(initialAmount: number, userId: number) {
    try {
      const data = await openCashRegisterService({ initialAmount, userId });
      if (data.success) {
        setRegisterStatus("open");
        closeCashRegisterForm();
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <CashRegisterContext.Provider
      value={{
        registerStatus,
        openCashRegisterForm,
        closeCashRegisterForm,
        openCashRegister,
        isOpenFormVisible,
      }}
    >
      {children}
    </CashRegisterContext.Provider>
  );
}

export function useCashRegister() {
  const context = useContext(CashRegisterContext);
  if (!context)
    throw new Error("useCashRegister must be used within a CashRegisterProvider");
  return context;
}
