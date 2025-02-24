const { Pool } = require('pg');
const faker = require('@faker-js/faker').faker;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'tienda',
  password: 'postgres',
  port: 5432,
});

async function truncateTables() {
  await pool.query('TRUNCATE TABLE cart_items RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE cart RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE customers RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE suppliers RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE categories RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  console.log('Tablas vaciadas con éxito');
}

async function seedUsers() {
  for (let i = 0; i < 8; i++) {
    const username = faker.internet.username(); // Corregido de userName a username
    const password = faker.internet.password();
    const email = faker.internet.email();
    const first_name = faker.person.firstName();
    const last_name = faker.person.lastName();
    const address = faker.location.streetAddress();
    const mobile_phone = faker.phone.number('555-####').slice(0, 20);
    const role = faker.helpers.arrayElement(['admin', 'user', 'manager', 'staff']);

    await pool.query(
      `INSERT INTO users (username, password, email, first_name, last_name, address, mobile_phone, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [username, password, email, first_name, last_name, address, mobile_phone, role]
    );
  }
  console.log('¡8 usuarios falsos insertados!');
}

async function seedSuppliers() {
  for (let i = 0; i < 10; i++) {
    const name = faker.company.name();
    const contact = faker.person.fullName();
    const phone = faker.phone.number('555-####').slice(0, 20);
    const email = faker.internet.email();
    const company_name = `${name} Inc.`;
    const tax_id = `TAX${String(i + 1).padStart(3, '0')}`;
    const address = faker.location.streetAddress();
    const supplier_type = faker.helpers.arrayElement(['electronics', 'food', 'clothing', 'medical', 'automotive', 'books', 'furniture', 'sports', 'toys', 'agriculture']);
    const status = faker.helpers.arrayElement(['active', 'inactive']);

    await pool.query(
      `INSERT INTO suppliers (name, contact, phone, email, company_name, tax_id, address, supplier_type, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [name, contact, phone, email, company_name, tax_id, address, supplier_type, status]
    );
  }
  console.log('¡10 proveedores falsos insertados!');
}

async function seedCategories() {
  const categories = [
    { name: 'Electronics', description: 'Devices and gadgets' },
    { name: 'Food', description: 'Edible products' },
    { name: 'Clothing', description: 'Wearable items' },
    { name: 'Medical', description: 'Health-related products' },
    { name: 'Automotive', description: 'Car parts and accessories' },
    { name: 'Books', description: 'Literature and educational material' },
    { name: 'Furniture', description: 'Home and office furnishings' },
    { name: 'Sports', description: 'Sporting goods and equipment' },
    { name: 'Toys', description: 'Children’s playthings' },
    { name: 'Agriculture', description: 'Farming tools and supplies' },
  ];

  for (const category of categories) {
    await pool.query(
      `INSERT INTO categories (name, description)
       VALUES ($1, $2)`,
      [category.name, category.description]
    );
  }
  console.log('¡10 categorías falsas insertadas!');
}

async function seedProducts() {
  for (let i = 0; i < 80; i++) {
    const supplier_id = faker.number.int({ min: 1, max: 10 });
    const category_id = faker.number.int({ min: 1, max: 10 });
    const name = faker.commerce.productName();
    const price = parseFloat(faker.commerce.price(5.99, 999.99));
    const description = faker.commerce.productDescription();
    const purchase_price = parseFloat(faker.commerce.price(3.00, price * 0.8));
    const sale_price = price;
    const sku = `SKU${String(i + 1).padStart(3, '0')}`;
    const barcode = faker.string.numeric(12);
    const brand = faker.company.name();
    const unit = faker.helpers.arrayElement(['unit', 'kg', 'pack', 'piece']);
    const min_stock = faker.number.int({ min: 5, max: 20 });
    const max_stock = faker.number.int({ min: min_stock + 10, max: 300 });
    const stock = faker.number.int({ min: max_stock, max: 500 });
    // Ajustamos actual_stock para que a veces sea menor que min_stock
    const actual_stock = faker.number.int({ min: 0, max: max_stock }); // Puede ser menor que min_stock
    const expiration_date = faker.date.future({ years: 2 }).toISOString().split('T')[0];
    const image = faker.image.url();

    const result = await pool.query(
      `INSERT INTO products (supplier_id, category_id, name, price, stock, description, purchase_price, sale_price, sku, barcode, brand, unit, min_stock, max_stock, actual_stock, expiration_date, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING id`,
      [supplier_id, category_id, name, price, stock, description, purchase_price, sale_price, sku, barcode, brand, unit, min_stock, max_stock, actual_stock, expiration_date, image]
    );
    const productId = result.rows[0].id;

    // Generar orden de compra si actual_stock < min_stock
    if (actual_stock < min_stock) {
      const quantityToOrder = max_stock - actual_stock; // Ordenamos suficiente para alcanzar max_stock
      await pool.query(
        `INSERT INTO purchase_orders (product_id, supplier_id, quantity, status)
         VALUES ($1, $2, $3, $4)`,
        [productId, supplier_id, quantityToOrder, 'pending']
      );
    }
  }
  console.log('¡80 productos falsos insertados con órdenes de compra generadas!');
}

async function seedCustomers() {
  for (let i = 0; i < 37; i++) {
    const user_id = faker.number.int({ min: 1, max: 8 });
    const first_name = faker.person.firstName();
    const last_name = faker.person.lastName();
    const address = faker.location.streetAddress();
    const phone = faker.phone.number('555-####').slice(0, 20);
    const company_name = faker.company.name();
    const tax_id = `CUST${String(i + 1).padStart(3, '0')}`;
    const email = faker.internet.email({ firstName: first_name, lastName: last_name });

    await pool.query(
      `INSERT INTO customers (user_id, first_name, last_name, address, phone, company_name, tax_id, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [user_id, first_name, last_name, address, phone, company_name, tax_id, email]
    );
  }
  console.log('¡37 clientes falsos insertados!');
}

async function seedMermas() {
  for (let i = 0; i < 20; i++) { // 20 mermas de ejemplo
    const product_id = faker.number.int({ min: 1, max: 80 });
    const quantity = faker.number.int({ min: 1, max: 10 });
    const type = faker.helpers.arrayElement(['vendido', 'dañado', 'perdido']);
    const date = faker.date.past({ years: 1 }).toISOString().split('T')[0];
    const value = parseFloat(faker.commerce.price(5.99, 99.99));
    const responsible_id = faker.number.int({ min: 1, max: 8 });
    const observations = faker.lorem.sentence();

    await pool.query(
      `INSERT INTO mermas (product_id, quantity, type, date, value, responsible_id, observations)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [product_id, quantity, type, date, value, responsible_id, observations]
    );
  }
  console.log('¡20 mermas falsas insertadas!');
}

(async () => {
  try {
    await truncateTables();
    await seedUsers();
    await seedSuppliers();
    await seedCategories();
    await seedProducts();
    await seedCustomers();
    await seedMermas();
    console.log('¡Todos los seeders ejecutados con éxito!');
  } catch (err) {
    console.error('Error en seedAll:', err);
  } finally {
    await pool.end();
  }
})();