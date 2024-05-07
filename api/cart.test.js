const request = require('supertest');
const express = require('express');
const sqlite3 = require('sqlite3');
const cartRoutes = require('./cart');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  if (req.headers['x-user-id']) {
    req.user = req.headers['x-user-id'];
  }
  next();
});
app.use('/cart', cartRoutes);

let db;
beforeAll((done) => {
    db = new sqlite3.Database('./db/espaza.db');
    db.run(`
        CREATE TABLE IF NOT EXISTS cart (
            id INTEGER PRIMARY KEY, 
            userId INTEGER, 
            itemId INTEGER, 
            quantity INTEGER,
            FOREIGN KEY(userId) REFERENCES users(id),
            FOREIGN KEY(itemId) REFERENCES items(id)
        )
    `, () => {
        db.run('INSERT INTO cart (userId, itemId, quantity) VALUES (?, ?, ?)', [1, 1, 1], done);
    });
}, 20000);

afterAll((done) => {
    db.run('DELETE FROM cart WHERE userId = ? AND itemId = ?', [1, 1], () => {
        db.close(done);
    });
}, 10000);

describe('POST /cart/add', () => {
    it('should add an item to the cart', async () => {
        const res = await request(app).post('/cart/add').set('x-user-id', '1').send({ userId: 1, itemId: 2, quantity: 1 });
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Item added to cart');
    });
});

describe('POST /cart/remove', () => {
    it('should remove an item from the cart', async () => {
        const res = await request(app).post('/cart/remove').set('x-user-id', '1').send({ userId: 1, itemId: 1 });
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Item removed from cart');
    });
});

describe('GET /cart/:userId', () => {
    it('should get all items in the cart for a user', async () => {
        const res = await request(app).get('/cart/1').set('x-user-id', '1');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
    });
});