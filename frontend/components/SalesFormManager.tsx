"use client"

import { SalesForm } from "./SalesForm"
import { useSalesForm } from "../contexts/SalesFormContext"
import { Button } from "@/components/ui/button"

export function SalesFormManager() {
  const { openSalesForm } = useSalesForm()

  return (
    <>
      <Button onClick={openSalesForm} className="bg-green-600 hover:bg-green-700 text-white">
        Nueva venta
      </Button>
      <SalesForm />
    </>
  )
}