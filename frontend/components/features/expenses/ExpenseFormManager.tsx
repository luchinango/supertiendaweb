"use client"

import { ExpenseForm } from "./ExpenseForm"
import { useExpenseForm } from '@/contexts/ExpenseFormContext'
import { Button } from "@/components/ui/button"

export function ExpenseFormManager() {
  const { openExpenseForm } = useExpenseForm()

  return (
    <>
      <Button onClick={openExpenseForm} className="bg-red-600 hover:bg-red-700 text-white">
        Nuevo gasto
      </Button>
      <ExpenseForm />
    </>
  )
}