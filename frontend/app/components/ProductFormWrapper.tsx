"use client"

import { NewProductForm } from "./NewProductForm"

export function ProductFormWrapper() {
  const handleSubmit = (productData: any) => {
    console.log("New product data:", productData)
    // Here you would typically add the product to your database
  }

  return <NewProductForm onSubmit={handleSubmit} />
}