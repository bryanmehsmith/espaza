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
    db.run("CREATE TABLE IF NOT EXISTS users (id TEXT, googleId TEXT, name TEXT, role TEXT)", () => {
        db.run('INSERT INTO users (id, role) VALUES (?, ?)', ['shopper', 'Shopper'], () => {
            db.run('insert into users (id, role) values (?, ?)', ['staff', 'Staff'], () => {
                db.run("CREATE TABLE IF NOT EXISTS cart (id INTEGER PRIMARY KEY, userId INTEGER, itemId INTEGER, quantity INTEGER, FOREIGN KEY(userId) REFERENCES users(id), FOREIGN KEY(itemId) REFERENCES items(id)", () => {
                    db.run('INSERT INTO cart (userId, itemId, quantity) VALUES (?, ?, ?)', ['shopper', 1, 1], () => {
                        db.run('INSERT INTO cart (userId, itemId, quantity) VALUES (?, ?, ?)', ['shopper', 2, 1], () => {
                            done();
                        });
                    });
                });
            });
        });
    });
}, 20000);

afterAll((done) => {
    db.run('DELETE FROM cart WHERE userId = ?', ['shopper'], () => {
        db.run('DELETE FROM cart WHERE userId = ?', ['staff'], () => {
            db.run('DELETE FROM users WHERE id = ?', ['shopper'], () => {
                db.close(done);
            });
        });
    });
}, 10000);

describe('POST /cart', () => {
    it('should add an item to the cart', async () => {
        await request(app)
        .post('/cart')
        .set('x-user-id', 'shopper')
        .send({ itemId: 2, quantity: 1 })
        .expect(200)
    });

    it('should add an item to the empty cart', async () => {
        await request(app)
        .post('/cart')
        .set('x-user-id', 'staff')
        .send({ itemId: 3, quantity: 1 })
        .expect(200)
    });
});

describe('DELETE /cart/:id', () => {
    it('should delete product', async () => {
        await request(app)
        .delete('/cart/1')
        .set('x-user-id', 'shopper')
        .expect(200)
    });
});

describe('get /cart/items', () => {
    it('should return all products as user', async () => {
        await request(app)
        .get('/cart/items')
        .expect(200)
        .set('x-user-id', 'shopper')
    });
});

describe('GET /cart/items/:userId', () => {
    it('should get all items in the cart for a user', async () => {
        await request(app)
        .get('/cart/items/1')
        .set('x-user-id', 'staff')
        .expect(200)
    });
});

describe('PUT /cart/:id', () => {
    it('should update product', async () => {
        await request(app)
        .put('/cart/2')
        .set('x-user-id', 'shopper')
        .send({ quantity: 2 })
        .expect(200)
    });
});