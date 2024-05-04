const request = require('supertest');
const express = require('express');
const sqlite3 = require('sqlite3');
const productsRoutes = require('./product');

const app = express();
app.use(express.json());
app.use('/products', productsRoutes);

let db;
beforeAll((done) => {
    db = new sqlite3.Database('./db/espaza.db');
    db.run(`
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY, 
            name TEXT, 
            description TEXT, 
            category TEXT, 
            price INTEGER
        )
    `, () => {
        db.run('INSERT INTO items (name, description, category, price) VALUES (?, ?, ?, ?)', ['Test Item', 'Test Description', 'Test Category', 100], done);
    });
}, 20000);

afterAll((done) => {
    db.run('DELETE FROM items WHERE name = ?', ['Test Item'], () => {
        db.close(done);
    });
}, 10000);

describe('GET /products', () => {
    it('should return all items', async () => {
        const res = await request(app).get('/products');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
    });

    it('should return items that match the search query', async () => {
        const res = await request(app).get('/products?search=Test Item');
        expect(res.statusCode).toEqual(200);
        expect(res.body[0].name).toEqual('Test Item');
    });

    it('should return items that match the price query', async () => {
        const res = await request(app).get('/products?price=100');
        expect(res.statusCode).toEqual(200);
        expect(res.body[0].price).toEqual(100);
    });

    it('should return items that match the category query', async () => {
        const res = await request(app).get('/products?category=Test Category');
        expect(res.statusCode).toEqual(200);
        expect(res.body[0].category).toEqual('Test Category');
    });
});