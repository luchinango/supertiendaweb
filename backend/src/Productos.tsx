import React, { useEffect, useState } from 'react';
import { ReactElement } from 'react';
import axios from 'axios';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
}

const Productos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get<Producto[]>('http://localhost:5000/api/productos');
        setProductos(response.data);
      } catch (error) {
        console.error('Error al obtener los productos', error);
      }
    };

    fetchProductos();
  }, []);

  return (
    <div>
      <h1>Lista de Productos</h1>
      <ul>
        {productos.map((producto) => (
          <li key={producto.id}>{producto.nombre}</li>
        ))}
      </ul>
    </div>
  );
};



/* const Productos: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    fetch('/api/productos')
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Productos</h1>
      <ul>
        {productos.map((Producto) => (
          <li key={Producto.id}>
            {Producto.nombre} - ${producto.precio} - Stock: {Producto.stock} - Categoría: {Producto.categoria}
          </li>
        ))}
      </ul>
    </div>
  );
}; */

