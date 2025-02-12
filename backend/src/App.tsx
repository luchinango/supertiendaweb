import React, { useEffect, useState } from 'react';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

const App: React.FC = () => {
  // const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    fetch('/api/usuarios')
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Usuarios</h1>
      <ul>
        {usuarios.map((usuario) => (
          <li key={usuario.id}>
            {usuario.nombre} - {usuario.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
