import React, { useEffect, useState } from 'react';
import { ReactElement } from 'react';
import axios from 'axios';

interface User {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
}

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get<User[]>('http://localhost:5000/api/usuarios');
        setUsuarios(response.data);
      } catch (error) {
        console.error('Error al obtener los usuarios del sistema', error);
      }
    };

    fetchUsuarios();
  }, []);

  return (
    <div>
      <h1>Lista de Productos</h1>
      <ul>
        {usuarios.map((user) => (
          <li key={user.id}>{user.nombre}</li>
        ))}
      </ul>
    </div>
  );
};

export default Usuarios;

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

