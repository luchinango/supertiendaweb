"use client"

import React from 'react'
import useSWR from 'swr'

// Función para hacer fetch de los datos
const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Función para formatear números con separador de miles según la configuración de Bolivia
const formatNumber = (value: number) =>
  value.toLocaleString('es-BO')

// Componente DashboardCard actualizado para formatear todos los números
function DashboardCard({
  title,
  value,
}: {
  title: string
  value: number | string
}) {
  // Función para parsear y formatear el valor
  const parseAndFormatValue = (val: number | string): string => {
    let num = typeof val === 'number' ? val : Number(val.replace("Bs.", "").trim())
    if (isNaN(num)) return String(val)
    return typeof val === 'string' && val.trim().startsWith("Bs.")
      ? `Bs. ${num.toLocaleString('es-BO')}`
      : num.toLocaleString('es-BO')
  }

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      <h3 style={{ fontSize: '14px', color: '#4A5568', marginBottom: '8px' }}>
        {title}
      </h3>
      <p
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '4px',
          textAlign: 'center' // Cambiado de 'right' a 'center'
        }}
      >
        {parseAndFormatValue(value)}
      </p>
    </div>
  )
}

export default function Home() {
  // Usa la URL del endpoint según corresponda, por ejemplo, vía variable de entorno
  const { data, error } = useSWR('http://localhost:5000/api/reports', fetcher)

  if (error) return <div>Error al cargar los datos.</div>
  if (!data) return <div>Cargando...</div>

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>
        Bienvenido a SuperTienda
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
        }}
      >
        <DashboardCard
          title="Ventas Totales"
          value={`Bs. ${data.totalSales}`}
        />
        <DashboardCard
          title="Productos Vendidos"
          value={data.productsSold}
        />
        <DashboardCard
          title="Clientes Activos"
          value={data.activeCustomers}
        />
        <DashboardCard
          title="Inventario Total"
          value={`Bs. ${data.totalInventory}`}
        />
      </div>
    </div>
  )
}

