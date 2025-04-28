"use client"

import { PromotionForm } from "./PromotionForm"
import { usePromotionForm } from "../context/PromotionFormContext"

export function PromotionFormWrapper() {
  const { isPromotionFormOpen } = usePromotionForm()

  if (!isPromotionFormOpen) return null

  return <PromotionForm />
}