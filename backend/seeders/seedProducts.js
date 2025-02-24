const { Pool } = require('pg');
const faker = require('@faker-js/faker').faker;

// Configura la conexión a tu base de datos
const pool = new Pool({
    user: 'postgres',           // Cambia por tu usuario real
    host: 'localhost',
    database: 'tienda',         // Cambia por tu base de datos real
    password: 'postgres',  // Cambia por tu contraseña real
    port: 5432,
});

(async () => {
    try {
        for (let i = 0; i < 50; i++) {
            const supplier_id = 1
            const name = `${faker.commerce.productName()}`; // Nombre de producto realista
            const price = parseFloat(faker.commerce.price(5.99, 199.99)); // Precio entre 5.99 y 199.99
            const stock = faker.number.int({ min: 1, max: 100 }); // Stock entre 1 y 100

            await pool.query(
                'INSERT INTO products (supplier_id, name, price, stock) VALUES ($1, $2, $3, $4)',
                [supplier_id, name, price, stock]
            );
        }
        console.log('¡50 productos falsos insertados con éxito!');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
})();