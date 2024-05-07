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
    Promise.all([
        new Promise((resolve, reject) => {
            db.run("CREATE TABLE IF NOT EXISTS users (id TEXT, googleId TEXT, name TEXT, role TEXT)", (err) => {
                if (err) reject(err);
                db.run('INSERT INTO users (id, role) VALUES (?, ?)', ['shopper', 'Shopper'], (err) => {
                    if (err) reject(err);
                    db.run('insert into users (id, role) values (?, ?)', ['staff', 'Staff'], (err) => {
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
                db.run('INSERT INTO products (id, name, category, quantity, price, description, image) VALUES (?, ?, ?, ?, ?, ?, ?)', [1, 'product1', 'category1', 10, 10.00, 'description1', 'image1'], (err) => {
                    if (err) reject(err);
                    db.run('INSERT INTO products (id, name, category, quantity, price, description, image) VALUES (?, ?, ?, ?, ?, ?, ?)', [2, 'product2', 'category2', 20, 20.00, 'description2', 'image2'], (err) => {
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
        db.run('INSERT INTO cart (userId, itemId, quantity) VALUES (?, ?, ?)', ['shopper', 1, 1], (err) => {
            if (err) {
                console.error(err);
                done(err);
            }
            db.run('INSERT INTO cart (userId, itemId, quantity) VALUES (?, ?, ?)', ['shopper', 2, 1], (err) => {
                if (err) {
                    console.error(err);
                    done(err);
                }
                done();
            });
        });
    }).catch((err) => {
        console.error(err);
        done(err);
    });
}, 20000);

function deleteFromTable(table, condition, value) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM ${table} WHERE ${condition} = ?`, [value], (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}

afterAll((done) => {
    Promise.all([
        deleteFromTable('cart', 'userId', 'shopper'),
        deleteFromTable('cart', 'userId', 'staff'),
        deleteFromTable('products', 'id', 1),
        deleteFromTable('products', 'id', 2),
        deleteFromTable('users', 'id', 'shopper'),
        deleteFromTable('users', 'id', 'staff')
    ]).then(() => {
        db.close(done);
    }).catch((err) => {
        console.error(err);
        done(err);
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
}, 10000);

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
}, 10000);

describe('GET /cart/items/:userId', () => {
    it('should get all items in the cart for a user', async () => {
        await request(app)
        .get('/cart/items/1')
        .set('x-user-id', 'staff')
        .expect(200)
    });
}, 10000);

describe('PUT /cart/:id', () => {
    it('should update product', async () => {
        await request(app)
        .put('/cart/2')
        .set('x-user-id', 'shopper')
        .send({ quantity: 2 })
        .expect(200)
    });
});