import React from 'react';

export default function Home() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>
        Welcome to eGrocery
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '24px', 
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '14px', color: '#4A5568', marginBottom: '8px' }}>
            Ventas Totales
          </h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
            $45,231.89
          </p>
          <p style={{ fontSize: '12px', color: '#718096' }}>
            +20.1% del mes pasado
          </p>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '24px', 
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '14px', color: '#4A5568', marginBottom: '8px' }}>
            Productos Vendidos
          </h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
            +2350
          </p>
          <p style={{ fontSize: '12px', color: '#718096' }}>
            +180.1% del mes pasado
          </p>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '24px', 
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '14px', color: '#4A5568', marginBottom: '8px' }}>
            Clientes Activos
          </h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
            +12,234
          </p>
          <p style={{ fontSize: '12px', color: '#718096' }}>
            +19% del mes pasado
          </p>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '24px', 
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '14px', color: '#4A5568', marginBottom: '8px' }}>
            Inventario Total
          </h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
            $12,543.00
          </p>
          <p style={{ fontSize: '12px', color: '#718096' }}>
            +201 productos
          </p>
        </div>
      </div>

      <div style={{ 
        marginTop: '24px',
        backgroundColor: '#4F46E5',
        color: 'white',
        padding: '16px',
        borderRadius: '8px'
      }}>
        Este texto debería tener fondo azul y texto blanco.
      </div>
    </div>
  );
}

