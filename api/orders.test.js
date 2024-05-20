const request = require('supertest');
const express = require('express');
const sqlite3 = require('sqlite3');
const ordersRouter = require('./orders');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  if (req.headers['x-user-id']) {
    req.user = req.headers['x-user-id'];
  }
  next();
});
app.use('/orders', ordersRouter);

let db;
beforeAll((done) => {
    db = new sqlite3.Database('./db/espaza.db');
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY, 
            userId INTEGER, 
            itemId INTEGER, 
            totalPrice INTEGER,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'pending',
            paymentStatus TEXT DEFAULT 'unpaid',
            FOREIGN KEY(userId) REFERENCES users(id),
            FOREIGN KEY(itemId) REFERENCES items(id)
        )
    `, () => {
        db.run('INSERT INTO orders (userId, itemId, totalPrice) VALUES (?, ?, ?)', [1, 1, 100], done);
    });
}, 20000);

afterAll((done) => {
    db.run('DELETE FROM orders WHERE userId = ? AND itemId = ?', [1, 1], () => {
        db.close(done);
    });
}, 10000);

describe('POST /orders/create', () => {
    it('should create a new order', async () => {
        const res = await request(app).post('/orders/create').set('x-user-id', '1');
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Order placed');
    });
});

describe('POST /orders/add', () => {
    it('should add an item to the order', async () => {
        const res = await request(app).post('/orders/add').set('x-user-id', '1').send({ orderId: 1, itemId: 2, quantity: 1, price: 50 });
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Order placed');
    });
});

describe('PUT /orders/checkout/:id', () => {
    it('should update the order status and trigger a notification', async () => {
        const res = await request(app).put('/orders/checkout/1').set('x-user-id', '1');
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Payment successful, order is now being packed');
    });
});

describe('GET /orders/', () => {
    it('should fetch all orders for the logged-in user', async () => {
        const res = await request(app).get('/orders/').set('x-user-id', '1');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
    });
});

describe('GET /orders/:id', () => {
    it('should fetch a specific order', async () => {
        const res = await request(app).get('/orders/1').set('x-user-id', '1');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('id', 1);
    });
});