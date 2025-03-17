import { Router, Request, Response } from 'express';
import express from 'express';
import pool from '../config/db';

const router: Router = express.Router();

interface Cart {
  id?: number;
  customer_id: number;
  created_at?: Date;
}

interface CartItem {
  id?: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  price_at_time: number;
  name?: string;
  price?: number;
}

/**
 * Validates if a cart exists by its ID
 * @param cartId - The ID of the cart to validate
 * @param res - Express response object
 * @returns Promise<boolean> - True if cart exists, false otherwise
 */
async function validateCartExists(cartId: number, res: Response): Promise<boolean> {
  const cart = await pool.query('SELECT id FROM cart WHERE id = $1', [cartId]);
  if (cart.rows.length === 0) {
    res.status(404).json({ error: `Cart with ID ${cartId} not found` });
    return false;
  }
  return true;
}

/**
 * @route POST /cart
 * @description Creates a new cart for a customer
 * @access Public
 * @param {number} customer_id - The ID of the customer
 * @returns {object} The created cart object
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { customer_id }: Partial<Cart> = req.body;
    if (!customer_id) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const result = await pool.query(
      'INSERT INTO cart (customer_id) VALUES ($1) RETURNING *',
      [customer_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * @route POST /cart/items
 * @description Adds a product to a cart
 * @access Public
 * @param {number} cart_id - The ID of the cart
 * @param {number} product_id - The ID of the product
 * @param {number} [quantity=1] - The quantity to add
 * @returns {object} The created cart item
 */
router.post('/items', async (req: Request, res: Response) => {
  try {
    const { cart_id, product_id, quantity }: Partial<CartItem> = req.body;
    if (!cart_id || !product_id) {
      return res.status(400).json({ error: 'Cart ID and Product ID are required' });
    }

    const finalQuantity = quantity ?? 1;
    if (!await validateCartExists(cart_id, res)) return;

    await pool.query('BEGIN');

    const productResult = await pool.query(
      `SELECT p.price, p.supplier_id, p.actual_stock,
              ci.consignment_id, ci.quantity_delivered, ci.quantity_sold
       FROM products p
       LEFT JOIN consignment_items ci ON ci.product_id = p.id
       LEFT JOIN consignments c ON ci.consignment_id = c.id AND c.supplier_id = p.supplier_id AND c.status = 'active'
       WHERE p.id = $1 FOR UPDATE`,
      [product_id]
    );

    if (productResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found' });
    }

    const { price, supplier_id, actual_stock, consignment_id, quantity_delivered, quantity_sold } = productResult.rows[0];
    const price_at_time = price;
    const availableStock = actual_stock;

    if (finalQuantity > availableStock) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: `Insufficient stock. Only ${availableStock} units available` });
    }

    if (consignment_id) {
      const availableToSell = quantity_delivered - (quantity_sold || 0);
      if (finalQuantity > availableToSell) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ error: `Only ${availableToSell} units available for this consignment` });
      }
      await pool.query(
        'UPDATE consignment_items SET quantity_sold = quantity_sold + $1 WHERE consignment_id = $2 AND product_id = $3',
        [finalQuantity, consignment_id, product_id]
      );
    }

    await pool.query(
      'UPDATE products SET actual_stock = actual_stock - $1 WHERE id = $2',
      [finalQuantity, product_id]
    );

    const result = await pool.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4) RETURNING *',
      [cart_id, product_id, finalQuantity, price_at_time]
    );

    await pool.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * @route GET /cart/:id
 * @description Retrieves the contents of a cart
 * @access Public
 * @param {string} id - The ID of the cart
 * @returns {object} Cart details and its items
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const cartIdNum = parseInt(id, 10);
    if (isNaN(cartIdNum)) {
      return res.status(400).json({ error: 'Cart ID must be a valid number' });
    }

    const cart = await pool.query('SELECT id, customer_id, created_at FROM cart WHERE id = $1', [cartIdNum]);
    if (cart.rows.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const items = await pool.query(
      'SELECT ci.*, p.name, p.price FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = $1',
      [cartIdNum]
    );

    res.json({
      cart: cart.rows[0],
      items: items.rows
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * @route DELETE /cart/:cartId/items/:itemId
 * @description Removes an item from a cart
 * @access Public
 * @param {string} cartId - The ID of the cart
 * @param {string} itemId - The ID of the item to remove
 * @returns {object} Details of the removed item and updated stock
 */
router.delete('/:cartId/items/:itemId', async (req: Request, res: Response) => {
  try {
    const { cartId, itemId } = req.params as { cartId: string; itemId: string };
    const cartIdNum = parseInt(cartId, 10);
    const itemIdNum = parseInt(itemId, 10);

    if (isNaN(cartIdNum) || isNaN(itemIdNum)) {
      return res.status(400).json({ error: 'Cart ID and Item ID must be valid numbers' });
    }

    if (!await validateCartExists(cartIdNum, res)) return;

    await pool.query('BEGIN');

    const item = await pool.query(
      'SELECT id, cart_id, product_id, quantity FROM cart_items WHERE id = $1 AND cart_id = $2',
      [itemIdNum, cartIdNum]
    );

    if (item.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ 
        error: `Cart item with ID ${itemId} not found in cart ${cartId}`,
        debug: `Searched for item with id = ${itemIdNum} in cart_id = ${cartIdNum}`
      });
    }

    const { product_id, quantity } = item.rows[0];

    const stockUpdate = await pool.query(
      'UPDATE products SET actual_stock = actual_stock + $1 WHERE id = $2 RETURNING actual_stock',
      [quantity, product_id]
    );

    if (stockUpdate.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(500).json({ error: `Failed to update stock for product ID ${product_id}` });
    }

    const consignmentItem = await pool.query(
      `SELECT ci.consignment_id
       FROM consignment_items ci
       JOIN consignments c ON ci.consignment_id = c.id
       WHERE c.supplier_id = (SELECT supplier_id FROM products WHERE id = $1) AND ci.product_id = $1 AND c.status = 'active'`,
      [product_id]
    );

    if (consignmentItem.rows.length > 0) {
      const consignmentId = consignmentItem.rows[0].consignment_id;
      await pool.query(
        'UPDATE consignment_items SET quantity_sold = quantity_sold - $1 WHERE consignment_id = $2 AND product_id = $3',
        [quantity, consignmentId, product_id]
      );
    }

    const result = await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND cart_id = $2 RETURNING *',
      [itemIdNum, cartIdNum]
    );

    await pool.query('COMMIT');
    res.status(200).json({
      message: `Item ${itemId} removed from cart ${cartId} successfully`,
      removedItem: result.rows[0],
      updatedStock: stockUpdate.rows[0].actual_stock
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ 
      error: 'Failed to remove item from cart',
      details: (error as Error).message 
    });
  }
});

/**
 * @route POST /cart/:id/checkout
 * @description Completes the purchase of a cart
 * @access Public
 * @param {string} id - The ID of the cart
 * @param {string} customer_payment_method - Payment method ("cash" or "credit")
 * @param {number} user_id - The ID of the user processing the transaction
 * @returns {object} Purchase details and transaction info
 */
router.post('/:id/checkout', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const cartIdNum = parseInt(id, 10);

    if (isNaN(cartIdNum)) {
      return res.status(400).json({ error: 'Cart ID must be a valid number' });
    }

    const { customer_payment_method, user_id } = req.body;

    if (!customer_payment_method) {
      return res.status(400).json({ 
        error: 'Customer payment method is required',
        expected: 'Must be "cash" or "credit"'
      });
    }
    if (!['cash', 'credit'].includes(customer_payment_method)) {
      return res.status(400).json({ 
        error: 'Invalid customer payment method',
        received: customer_payment_method,
        expected: 'Must be "cash" or "credit"'
      });
    }

    if (!user_id || isNaN(parseInt(user_id, 10))) {
      return res.status(400).json({ error: 'User ID is required and must be a valid number' });
    }

    if (!await validateCartExists(cartIdNum, res)) return;

    const cart = await pool.query('SELECT customer_id FROM cart WHERE id = $1', [cartIdNum]);
    const customerId = cart.rows[0].customer_id;

    const cartItems = await pool.query(
      'SELECT ci.*, p.price, p.supplier_id FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = $1',
      [cartIdNum]
    );
    if (cartItems.rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const totalCost = cartItems.rows.reduce((sum: number, item: CartItem) => {
      return sum + (item.quantity * item.price_at_time);
    }, 0);

    await pool.query('BEGIN');

    if (customer_payment_method === 'credit') {
      const customer = await pool.query(
        'SELECT credit_balance FROM customers WHERE id = $1 FOR UPDATE',
        [customerId]
      );
      if (customer.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ error: 'Customer not found' });
      }

      const creditBalance = customer.rows[0].credit_balance || 0;
      if (creditBalance < totalCost) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ 
          error: `Insufficient credit balance. Available: ${creditBalance}, Required: ${totalCost}` 
        });
      }

      await pool.query(
        'UPDATE customers SET credit_balance = credit_balance - $1 WHERE id = $2',
        [totalCost, customerId]
      );
    }

    const transactionResult = await pool.query(
      `INSERT INTO transactions (customer_id, user_id, amount, type, reference, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *`,
      [customerId, user_id, totalCost, customer_payment_method, `Checkout cart ${cartIdNum}`]
    );

    for (const item of cartItems.rows) {
      const { product_id, quantity, supplier_id } = item;

      const consignmentItem = await pool.query(
        `SELECT ci.consignment_id, ci.quantity_sold
         FROM consignment_items ci
         JOIN consignments c ON ci.consignment_id = c.id
         WHERE c.supplier_id = $1 AND ci.product_id = $2 AND c.status = 'active'`,
        [supplier_id, product_id]
      );

      if (consignmentItem.rows.length > 0) {
        const consignmentId = consignmentItem.rows[0].consignment_id;
        const currentSold = consignmentItem.rows[0].quantity_sold || 0;

        if (currentSold < quantity) {
          await pool.query(
            'UPDATE consignment_items SET quantity_sold = quantity_sold + $1 WHERE consignment_id = $2 AND product_id = $3',
            [quantity - currentSold, consignmentId, product_id]
          );
        }
      }
    }

    await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartIdNum]);

    await pool.query('COMMIT');

    res.json({
      message: `Purchase for cart ${cartIdNum} completed successfully`,
      total_cost: totalCost,
      customer_payment_method,
      transaction: transactionResult.rows[0]
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ 
      error: 'Failed to complete purchase',
      details: (error as Error).message 
    });
  }
});

export default router;