const jwt = require('jsonwebtoken');
const JWT_SECRET = 'clave_secreta_para_desarrollo'; // Debe coincidir con tu .env

const user = {
    id: 1,
    email: 'test@example.com',
    role_id: 1 // Rol permitido
};

const token = jwt.sign(user, JWT_SECRET, { expiresIn: '8h' });
console.log(token);