import { NextResponse } from 'next/server'

export async function GET() {
  const reportData = {
    totalCredits: 1234.56,
    totalDebts: 789.01,
    salesThisMonth: 4567.89,
  }
  return NextResponse.json(reportData)
}