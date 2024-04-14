const request = require('supertest');
const express = require('express');
const users = require('./users');
const app = express();
app.use(express.json());
app.use('/users', users);

beforeEach(async () => {
    newUser = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'testpassword'
    };

    const response = await request(app).post('/users').send(newUser);
    createdUser = response.body;
});

afterEach(async () => {
    await request(app).delete(`/users/${createdUser.id}`);
});

describe('POST /users', () => {
    it('should create a new user', async () => {
        newUser2 = {
            name: 'Test User2',
            email: 'testuser2@example.com',
            password: 'testpassword2'
        };

        await request(app)
            .post('/users')
            .send(newUser2)
            .expect(201)
            .then(response => {
            // Check the response body
            expect(response.body).toBeInstanceOf(Object);
            expect(response.body.id).toBeDefined();
            expect(response.body.name).toBe(newUser2.name);
            expect(response.body.email).toBe(newUser2.email);
            expect(response.body.password).toBeUndefined();
            });
    });

    it('should return an error', async () => {
        await request(app)
            .post('/users')
            .send(newUser)
            .expect(400)
            .then(response => {
            // Check the response body
            expect(response.body).toBeInstanceOf(Object);
            expect(response.body.error).toBe('User already exists');
            });
    });
});

describe('GET /users', () => {
    it('should return all users', async () => {
        await request(app)
        .get('/users')
        .expect(200)
        .then(response => {
            // Check the response body
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBeGreaterThan(0);
        });
    });
});

describe('GET /users/:id', () => {
    it('should return the Test User', async () => {
        await request(app)
        .get(`/users/${createdUser.id}`)
        .expect(200)
        .then(response => {
            expect(response.body.name).toBe(newUser.name);
            expect(response.body.email).toBe(newUser.email);
            expect(response.body.password).toBeUndefined();
        });
    });
});

describe('DELETE /users/:id', () => {
    it('should delete the Test User', async () => {
        await request(app)
        .delete(`/users/${createdUser.id}`)
        .expect(204);
    });
});