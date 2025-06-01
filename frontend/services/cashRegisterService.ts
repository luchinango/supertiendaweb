export async function openCashRegister(data: { initialAmount: number; userId: number }) {
  const response = await fetch('/api/cash-registers/open', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Error al abrir caja');
  }
  return response.json();
}