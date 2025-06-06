import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { initialAmount, userId } = await request.json();

  // Aquí iría la lógica real (acceso a la BD, validaciones, etc.)
  const result = {
    success: true,
    cashRegisterId: 1,
    initialAmount,
    userId,
    message: "Caja abierta correctamente",
  };

  return NextResponse.json(result, { status: 201 });
}