const request = require('supertest');
const express = require('express');
const sqlite3 = require('sqlite3');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    if (req.headers['x-user-id']) {
      req.user = req.headers['x-user-id'];
    }
    next();
  });
app.use('/products', require('./products'));

let db;
let user_db;

beforeAll((done) => {
    db = new sqlite3.Database('./db/espaza.db');
    db.run("CREATE TABLE IF NOT EXISTS users (id TEXT, googleId TEXT, name TEXT, role TEXT)", () => {
        db.run('INSERT INTO users (id, role) VALUES (?, ?)', ['product', 'Staff'], () => {
            db.run('INSERT INTO users (id, role) VALUES (?, ?)', ['shopper', 'Shopper'], () => {
                db.run("CREATE TABLE IF NOT EXISTS products (id TEXT, name TEXT, category TEXT, quantity INTEGER, price DOUBLE PRECISION, description TEXT, image TEXT)", () => {
                    db.run('INSERT INTO products (id, name, category, quantity, price) VALUES (?, ?, ?, ?, ?)', ['1', 'Apple', 'Fruit', 10, 5.0], () => {
                        db.run('INSERT INTO products (id, name, category, quantity, price) VALUES (?, ?, ?, ?, ?)', ['2', 'Beef', 'Meat', 5, 10.0], () => {
                            done();
                        });
                    });
                });
            });
        });
    });
}, 20000);

afterAll((done) => {
    db.run('DELETE FROM users where id = ?', ['product'], () => {
        db.run('DELETE FROM users where id = ?', ['shopper'], () => {
            db.run('DELETE FROM products where id = ?', ['1'], () => {
                db.run('DELETE FROM products where id = ?', ['2'], () => {
                    db.run('DELETE FROM products where name = ?', ['test'], () => {
                        db.close(done);
                    });
                });
            });
        });
    });
}, 10000);

describe('get /products', () => {
    it('should return all products as user', async () => {
        await request(app)
        .get('/products')
        .expect(200)
        .set('x-user-id', 'shopper')
        .then((response) => {
            expect(response.body.products.length).toBeGreaterThanOrEqual(2);
        });
    });

    it('should return all products as Staff', async () => {
        await request(app)
        .get('/products')
        .expect(200)
        .set('x-user-id', 'product')
        .then((response) => {
            expect(response.body.products.length).toBeGreaterThanOrEqual(2);
        });
    });

    it('should return items that match the search query', async () => {
        await request(app)
        .get('/products?search=apple')
        .expect(200)
        .set('x-user-id', 'shopper')
        .then((response) => {
            expect(response.body.products.length).toBeGreaterThanOrEqual(1);
            expect(response.body.products[0].name).toEqual('Apple');
        });
    });

    it('should return items that match the price query', async () => {
        await request(app)
        .get('/products?price=10')
        .expect(200)
        .set('x-user-id', 'shopper')
        .then((response) => {
            expect(response.body.products.length).toBeGreaterThanOrEqual(2);
        });
    });

    it('should return items that match the category query', async () => {
        await request(app)
        .get('/products?category=fruit')
        .expect(200)
        .set('x-user-id', 'shopper')
        .then((response) => {
            expect(response.body.products.length).toBe(1);
            expect(response.body.products[0].category).toEqual('Fruit');
        });
    });

    it('should return items that match multiple queries', async () => {
        await request(app)
        .get('/products?search=apple&category=fruit&price=10')
        .expect(200)
        .set('x-user-id', 'shopper')
        .then((response) => {
            expect(response.body.products.length).toBe(1);
            expect(response.body.products[0].category).toEqual('Fruit');
            expect(response.body.products[0].price).toEqual(5);
        });
    });
});

describe('put /products/:id', () => {
    it('should update product', async () => {
        await request(app)
        .put('/products/1')
        .set('x-user-id', 'product')
        .send({ name: 'Apple', category: 'Fruit', quantity: 20, price: 5 })
        .expect(200)
        .then((response) => {
            expect(response.body.message).toBe('Product updated successfully');
        });
    });
});

describe('delete /products/:id', () => {
    it('should delete product', async () => {
        await request(app)
        .delete('/products/2')
        .set('x-user-id', 'product')
        .expect(200)
        .then((response) => {
            expect(response.body.message).toBe('Product deleted successfully');
        });
    });
});

describe('post /products', () => {
    it('should add product with image', async () => {
        await request(app)
        .post('/products')
        .set('x-user-id', 'product')
        .field('name', 'test')
        .field('category', 'Meat')
        .field('quantity', 10)
        .field('price', 10)
        .field('description', 'this is a test')
        .attach('formFile', 'static/images/e-spaza_transparent_red.png')
        .expect(201)
        .then((response) => {
            expect(response.body.message).toBe('Product added successfully');
        });
    });

    it('should return error for missing name', async () => {
        await request(app)
        .post('/products')
        .set('x-user-id', 'product')
        .send({ category: 'Meat', quantity: 10, price: 10 })
        .expect(400)
    });

    it('should add product with image', async () => {
        await request(app)
        .post('/products')
        .set('x-user-id', 'product')
        .field('name', 'test')
        .field('category', 'Meat2')
        .field('quantity', 102)
        .field('price', 12)
        .field('description', 'this is a test')
        .expect(201)
        .then((response) => {
            expect(response.body.message).toBe('Product added successfully');
        });
    });
});