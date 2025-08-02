// index.js
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Cho phép cross-origin requests
app.use(express.json()); // Cho phép server đọc JSON từ request body

// --- API Endpoints ---

// Ví dụ: Thay thế cho getProducts()
app.get('/api/products', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM products ORDER BY name ASC');
        // Chuyển đổi từ snake_case sang camelCase nếu cần
        const products = rows.map((p) => ({
            ...p,
            minStock: p.min_stock,
            supplierId: p.supplier_id,
            productType: p.product_type,
            imageUrl: p.image_url,
        }));
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Ví dụ: Thay thế cho createOrder()
app.post('/api/orders', async (req, res) => {
    try {
        const { customerId, customerName, items, total /* ... các trường khác */ } = req.body;

        // Logic để tạo ID mới, ví dụ: 'DH' + Date.now()
        const newOrderId = `DH${Date.now()}`;

        const queryText = `
            INSERT INTO orders (id, customer_id, customer_name, items, total, status, payment_status)
            VALUES ($1, $2, $3, $4, $5, 'Chờ xác nhận', 'Chưa thanh toán')
            RETURNING *;
        `;
        const values = [newOrderId, customerId, customerName, JSON.stringify(items), total];

        const { rows } = await db.query(queryText, values);

        res.status(201).json({ success: true, newOrder: rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ... Tạo thêm các endpoints khác cho customers, suppliers, etc.

app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});
