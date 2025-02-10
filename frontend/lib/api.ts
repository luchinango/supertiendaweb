async function fetchAPI(endpoint: string, method = 'GET', body: any = null) {
  const options: RequestInit = { method }
  
  if (body) {
    options.headers = { 'Content-Type': 'application/json' }
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`/api/${endpoint}`, options)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred')
  }

  return data
}

export const api = {
  getProducts: () => fetchAPI('products'),
  createProduct: (product: any) => fetchAPI('products', 'POST', product),
}
