'use client'

import { useState } from 'react'
import { CashRegister } from './CashRegister'

export default function Header() {
  const [isCashRegisterOpen, setIsCashRegisterOpen] = useState(false)
  const [cashRegisterStatus, setCashRegisterStatus] = useState('Cerrada')

  const toggleCashRegister = () => {
    setIsCashRegisterOpen(!isCashRegisterOpen)
  }

  return (
    <>
      {isCashRegisterOpen && (
        <CashRegister
          isOpen={isCashRegisterOpen}
          onClose={() => setIsCashRegisterOpen(false)}
          status={cashRegisterStatus}
          onStatusChange={setCashRegisterStatus}
        />
      )}
    </>
  )
}
