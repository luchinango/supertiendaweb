import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { initialAmount, userId } = await request.json();

  // Aquí iría la lógica para registrar la apertura de caja en tu base de datos
  // Por ahora devolvemos datos simulados
  const result = {
    success: true,
    cashRegisterId: 1,
    initialAmount,
    userId,
    message: "Caja abierta correctamente",
  };

  return NextResponse.json(result, { status: 201 });
}