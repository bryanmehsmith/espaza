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
    Promise.all([
        new Promise((resolve, reject) => {
            db.run("CREATE TABLE IF NOT EXISTS users (id TEXT, googleId TEXT, name TEXT, role TEXT)", (err) => {
                if (err) reject(err);
                db.run('INSERT INTO users (id, role) VALUES (?, ?)', ['shopper-cart', 'Shopper'], (err) => {
                    if (err) reject(err);
                    db.run('insert into users (id, role) values (?, ?)', ['staff-cart', 'Staff'], (err) => {
                        if (err) reject(err);
                        resolve();
                    });
                });
                resolve();
            });
        }),
        new Promise((resolve, reject) => {
            db.run("CREATE TABLE IF NOT EXISTS products (id TEXT, name TEXT, category TEXT, quantity INTEGER, price DOUBLE PRECISION, description TEXT, image TEXT)", (err) => {
                if (err) reject(err);
                db.run('INSERT INTO products (id, name, category, quantity, price, description, image) VALUES (?, ?, ?, ?, ?, ?, ?)', ['1-cart', 'product1', 'category1', 10, 10.00, 'description1', 'image1'], (err) => {
                    if (err) reject(err);
                    db.run('INSERT INTO products (id, name, category, quantity, price, description, image) VALUES (?, ?, ?, ?, ?, ?, ?)', ['2-cart', 'product2', 'category2', 20, 20.00, 'description2', 'image2'], (err) => {
                        if (err) reject(err);
                        resolve();
                    });
                });
            });
        }),
        new Promise((resolve, reject) => {
            db.run("CREATE TABLE IF NOT EXISTS cart (id INTEGER PRIMARY KEY, userId INTEGER, itemId INTEGER, quantity INTEGER, FOREIGN KEY(userId) REFERENCES users(id), FOREIGN KEY(itemId) REFERENCES items(id))", (err) => {
                if (err) reject(err);
                resolve();
            });
        })
    ]).then(() => {
        db.run('INSERT INTO cart (userId, itemId, quantity) VALUES (?, ?, ?)', ['shopper-cart', '1-cart', 1], (err) => {
            if (err) {
                console.error(err);
                done(err);
            }
            db.run('INSERT INTO cart (userId, itemId, quantity) VALUES (?, ?, ?)', ['shopper-cart', '2-cart', 1], (err) => {
                if (err) {
                    console.error(err);
                    done(err);
                }
                db.run('INSERT INTO orders (userId) VALUES (?)', ['shopper-cart'], (err) => {
                    if (err) {
                        console.error(err);
                        done(err);
                    }
                    done();
                });
            });
        });
    }).catch((err) => {
        console.error(err);
        done(err);
    });
}, 20000);

afterAll((done) => {
    db.run('DELETE FROM orders WHERE userId = ? AND itemId = ?', [1, 1], () => {
        db.close(done);
    });
}, 10000);

describe('POST /orders/create', () => {
    it('should create a new order', async () => {
        const res = await request(app).post('/orders/create').set('x-user-id', 'shopper-cart');
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Payment successful, order is now being packed');
    });
});

describe('POST /orders/add', () => {
    it('should add an item to the order', async () => {
        const res = await request(app).post('/orders/add').set('x-user-id', '1').send({ orderId: 1, itemId: 2, quantity: 1, price: 50 });
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Order placed');
    });
});

describe('PUT /orders/update/:id', () => {
    it('should update the order status and trigger a notification', async () => {
        const res = await request(app).put('/orders/update/1').set('x-user-id', '1').send({ status: 'packed'});
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Order is now being packed');
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

describe('GET /orders/items', () => {
    it('should fetch a specific order items', async () => {
        const res = await request(app).get('/orders/items').set('x-user-id', '1');
        expect(res.statusCode).toEqual(200);
    });
});