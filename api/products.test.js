const request = require('supertest');
const express = require('express');
const products = require('./products');
const app = express();
app.use(express.json());
app.use('/products', products);

beforeEach(async () => {
    newProduct = {
        name: 'Laptop',
        serial: '1234',
        price: '2000'
    };

    const response = await request(app).post('/products').send(newProduct);
    createdProduct = response.body;
});

afterEach(async () => {
    await request(app).delete(`/products/${createdProduct.id}`);
});

describe('POST /products', () => {
    it('should create a new product', async () => {
        newProduct2 = {
            name: 'Laptop',
            serial: '4231',
            price: '2000'
        };

        await request(app)
            .post('/products')
            .send(newProduct2)
            .expect(201)
            .then(response => {
            // Check the response body
            expect(response.body).toBeInstanceOf(Object);
            expect(response.body.id).toBeDefined();
            expect(response.body.name).toBe(newProduct2.name);
            expect(response.body.serial).toBe(newProduct2.serial);
            expect(response.body.price).toBe(newProduct2.price);
            });
    });

    it('should return an error', async () => {
        await request(app)
            .post('/products')
            .send(newProduct)
            .expect(400)
            .then(response => {
            // Check the response body
            expect(response.body).toBeInstanceOf(Object);
            expect(response.body.error).toBe('Product already exists');
            });
    });
});

describe('GET /products', () => {
    it('should return all products', async () => {
        await request(app)
        .get('/products')
        .expect(200)
        .then(response => {
            // Check the response body
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBeGreaterThan(0);
        });
    });
});

describe('GET /products/:id', () => {
    it('should return the Test Product', async () => {
        await request(app)
        .get(`/products/${createdProduct.id}`)
        .expect(200)
        .then(response => {
            expect(response.body.name).toBe(newProduct.name);
            expect(response.body.serial).toBe(newProduct.serial);
            expect(response.body.price).toBe(newProduct.price);
        });
    });
});

describe('DELETE /products/:id', () => {
    it('should delete the Test Product', async () => {
        await request(app)
        .delete(`/products/${createdProduct.id}`)
        .expect(204);
    });
});