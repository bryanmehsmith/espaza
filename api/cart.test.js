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
        deleteFromTable('cart', 'userId', 'shopper-cart'),
        deleteFromTable('cart', 'userId', 'staff-cart'),
        deleteFromTable('products', 'id', '1-cart'),
        deleteFromTable('products', 'id', '2-cart'),
        deleteFromTable('users', 'id', 'shopper-cart'),
        deleteFromTable('users', 'id', 'staff-cart')
    ]).then(() => {
        db.close(done);
    }).catch((err) => {
        console.error(err);
        done(err);
    });
}, 20000);

describe('POST /cart', () => {
    it('should add an item to the cart', async () => {
        await request(app)
        .post('/cart')
        .set('x-user-id', 'shopper-cart')
        .send({ itemId: '2-cart', quantity: 1 })
        .expect(200)
    }, 20000);

    it('should add an item to the empty cart', async () => {
        await request(app)
        .post('/cart')
        .set('x-user-id', 'staff-cart')
        .send({ itemId: '2-cart', quantity: 1 })
        .expect(200)
    }, 20000);
});

describe('DELETE /cart/:id', () => {
    it('should delete product', async () => {
        await request(app)
        .delete('/cart/1-cart')
        .set('x-user-id', 'shopper-cart')
        .expect(200)
    }, 20000);
});

describe('get /cart/items', () => {
    it('should return all products as user', async () => {
        await request(app)
        .get('/cart/items')
        .expect(200)
        .set('x-user-id', 'shopper-cart')
    }, 20000);
});

describe('GET /cart/items/:userId', () => {
    it('should get all items in the cart for a user', async () => {
        await request(app)
        .get('/cart/items/1-cart')
        .set('x-user-id', 'staff-cart')
        .expect(200)
    }, 20000);
});

describe('PUT /cart/:id', () => {
    it('should update product', async () => {
        await request(app)
        .put('/cart/2-cart')
        .set('x-user-id', 'shopper-cart')
        .send({ quantity: 2 })
        .expect(200)
    }, 20000);
});