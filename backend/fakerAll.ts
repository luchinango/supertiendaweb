import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import pool from "./config/db";

async function generateFakeData() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Deshabilitar triggers para cada tabla individualmente
    await client.query("ALTER TABLE mermas DISABLE TRIGGER ALL");
    await client.query("ALTER TABLE credits DISABLE TRIGGER ALL");
    await client.query("ALTER TABLE customers DISABLE TRIGGER ALL");
    await client.query("ALTER TABLE products DISABLE TRIGGER ALL");
    await client.query("ALTER TABLE suppliers DISABLE TRIGGER ALL");
    await client.query("ALTER TABLE categories DISABLE TRIGGER ALL");
    await client.query("ALTER TABLE users DISABLE TRIGGER ALL");

    // Truncar cada tabla individualmente
    await client.query("TRUNCATE TABLE mermas RESTART IDENTITY CASCADE");
    await client.query("TRUNCATE TABLE credits RESTART IDENTITY CASCADE");
    await client.query("TRUNCATE TABLE customers RESTART IDENTITY CASCADE");
    await client.query("TRUNCATE TABLE products RESTART IDENTITY CASCADE");
    await client.query("TRUNCATE TABLE suppliers RESTART IDENTITY CASCADE");
    await client.query("TRUNCATE TABLE categories RESTART IDENTITY CASCADE");
    await client.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");

    // Insertar Proveedores (10 registros)
    const suppliers = [
      {
        name: "Generic Supplier".slice(0, 20),
        contact: "Default Contact".slice(0, 20),
        email: "generic@supplier.com".slice(0, 20),
        phone: "000-0000000".slice(0, 20),
        address: "123 Generic St".slice(0, 20),
        company_name: "Generic Corp".slice(0, 20),
        tax_id: "GENERIC123".slice(0, 20),
        supplier_type: "supplier".slice(0, 20),
      },
      ...Array(9)
        .fill(null)
        .map(() => ({
          name: faker.company.name().slice(0, 20),
          contact: faker.person.fullName().slice(0, 20),
          email: faker.internet.email().slice(0, 20),
          phone: faker.phone.number().slice(0, 20),
          address: faker.location.streetAddress().slice(0, 20),
          company_name: faker.company.name().slice(0, 20),
          tax_id: `TAX${faker.number.int({ min: 1000000, max: 9999999 })}`.slice(0, 20),
          supplier_type: faker.helpers.arrayElement([
            "electronics",
            "food",
            "clothing",
            "misc",
          ]).slice(0, 20),
        })),
    ];

    for (const supplier of suppliers) {
      await client.query(
        `INSERT INTO suppliers (name, contact, email, phone, address, company_name, tax_id, supplier_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        Object.values(supplier)
      );
    }

    // Insertar Categorías (6 registros)
    const categories = [
      "Electrónicos",
      "Hogar",
      "Ropa",
      "Alimentos",
      "Juguetes",
      "Herramientas",
    ];

    for (const category of categories) {
      await client.query("INSERT INTO categories (name) VALUES ($1)", [
        category.slice(0, 20),
      ]);
    }

    // Insertar Usuarios (5 registros) usando role_id en lugar de role
    const users = Array(5)
      .fill(null)
      .map(() => ({
        username: faker.internet.userName().slice(0, 20),
        password: faker.internet.password(),
        email: faker.internet.email().slice(0, 20),
        first_name: faker.person.firstName().slice(0, 20),
        last_name: faker.person.lastName().slice(0, 20),
        address: faker.location.streetAddress().slice(0, 20),
        mobile_phone: faker.phone.number().slice(0, 20),
        role_id: faker.number.int({ min: 1, max: 3 }), // Asumiendo que roles tiene IDs 1, 2, 3
      }));

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await client.query(
        `INSERT INTO users (username, password, email, first_name, last_name, address, mobile_phone, role_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          ...Object.values(user).slice(0, 1),
          hashedPassword,
          ...Object.values(user).slice(2),
        ]
      );
    }

    // Insertar Clientes (20 registros)
    for (let i = 0; i < 20; i++) {
      await client.query(
        `INSERT INTO customers (user_id, first_name, last_name, company_name, tax_id, address, phone, email, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          faker.number.int({ min: 1, max: 5 }),
          faker.person.firstName().slice(0, 20),
          faker.person.lastName().slice(0, 20),
          faker.company.name().slice(0, 20),
          `TAX${faker.number.int({ min: 1000000, max: 9999999 })}`.slice(0, 20),
          faker.location.streetAddress().slice(0, 20),
          faker.phone.number().slice(0, 20),
          faker.internet.email().slice(0, 20),
          "active".slice(0, 20),
        ]
      );
    }

    // Insertar Productos (30 registros)
    for (let i = 0; i < 30; i++) {
      await client.query(
        `INSERT INTO products (
            supplier_id, category_id, name, price, stock, description,
            purchase_price, sale_price, sku, barcode, brand, unit,
            min_stock, max_stock, actual_stock, expiration_date, image
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          faker.number.int({ min: 1, max: 10 }),
          faker.number.int({ min: 1, max: 6 }),
          faker.commerce.productName().slice(0, 20),
          faker.number.float({ min: 10 * 100, max: 1000 * 100 }) / 100,
          faker.number.int({ min: 0, max: 500 }),
          faker.commerce.productDescription().slice(0, 20),
          faker.number.float({ min: 5 * 100, max: 500 * 100 }) / 100,
          faker.number.float({ min: 10 * 100, max: 1000 * 100 }) / 100,
          faker.string.alphanumeric(10).slice(0, 20),
          faker.string.numeric(13).slice(0, 20),
          faker.company.name().slice(0, 20),
          faker.helpers.arrayElement(["unidades", "litros", "kg"]).slice(0, 20),
          faker.number.int({ min: 5, max: 20 }),
          faker.number.int({ min: 50, max: 200 }),
          faker.number.int({ min: 0, max: 200 }),
          faker.date.future(),
          faker.image.url().slice(0, 20),
        ]
      );
    }

    // Insertar Mermas (15 registros)
    for (let i = 0; i < 15; i++) {
      await client.query(
        `INSERT INTO mermas (product_id, quantity, type, date, value, responsible_id, observations)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          faker.number.int({ min: 1, max: 30 }),
          faker.number.int({ min: 1, max: 10 }),
          faker.helpers.arrayElement(["vendido", "dañado", "perdido"]).slice(0, 20),
          faker.date.recent({ days: 60 }),
          faker.number.float({ min: 10 * 100, max: 500 * 100 }) / 100,
          faker.number.int({ min: 1, max: 5 }),
          faker.lorem.sentence().slice(0, 20),
        ]
      );
    }

    await client.query("COMMIT");
    console.log("✅ Datos de prueba generados exitosamente!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error generando datos de prueba:", error);
  } finally {
    // Habilitar triggers para cada tabla individualmente
    await client.query("ALTER TABLE mermas ENABLE TRIGGER ALL");
    await client.query("ALTER TABLE credits ENABLE TRIGGER ALL");
    await client.query("ALTER TABLE customers ENABLE TRIGGER ALL");
    await client.query("ALTER TABLE products ENABLE TRIGGER ALL");
    await client.query("ALTER TABLE suppliers ENABLE TRIGGER ALL");
    await client.query("ALTER TABLE categories ENABLE TRIGGER ALL");
    await client.query("ALTER TABLE users ENABLE TRIGGER ALL");

    client.release();
    await pool.end();
  }
}

generateFakeData();