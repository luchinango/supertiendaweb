"use client"

import { PromotionForm } from "./PromotionForm"
import { usePromotionForm } from '@/contexts/PromotionFormContext'

export function PromotionFormWrapper() {
  const { isPromotionFormOpen } = usePromotionForm()

  if (!isPromotionFormOpen) return null

  return <PromotionForm />
}