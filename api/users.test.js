const request = require('supertest');
const express = require('express');
const users = require('./users');
const app = express();
app.use(express.json());
app.use('/api/users', users);

beforeEach(async () => {
    newUser = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'testpassword'
    };

    const response = await request(app).post('/api/users/register').send(newUser);
    createdUser = response.body;
});

afterEach(async () => {
    await request(app).delete(`/api/users/${createdUser.id}`);
});

describe('POST /api/users/register', () => {
    it('should create a new user', async () => {
        newUser2 = {
            name: 'Test User2',
            email: 'testuser2@example.com',
            password: 'testpassword2'
        };

        await request(app)
            .post('/api/users/register')
            .send(newUser2)
            .expect(201)
            .then(response => {
            // Check the response body
            expect(response.body).toBeInstanceOf(Object);
            expect(response.body.name).toBe(newUser2.name);
            expect(response.body.email).toBe(newUser2.email);
            expect(response.body.password).toBeUndefined();
            });
    });

    it('should return an error', async () => {
        await request(app)
            .post('/api/users/register')
            .send(newUser)
            .expect(400)
            .then(response => {
            // Check the response body
            expect(response.body).toBeInstanceOf(Object);
            expect(response.body.error).toBe('User already exists');
            });
    });
});

describe('GET /api/users', () => {
    it('should return all users', async () => {
        await request(app)
        .get('/api/users')
        .expect(200)
        .then(response => {
            // Check the response body
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBeGreaterThan(0);
        });
    });
});

describe('GET /api/users/:id', () => {
    it('should return the Test User', async () => {
        await request(app)
        .get(`/api/users/${createdUser.id}`)
        .expect(200)
        .then(response => {
            expect(response.body.name).toBe(newUser.name);
            expect(response.body.email).toBe(newUser.email);
            expect(response.body.password).toBeUndefined();
        });
    });
});

describe('POST /api/users/login', () => {
    it('should return Success', async () => {
        await request(app)
        .post('/api/users/login')
        .send({ email: newUser.email, password: newUser.password })
        .expect(200)
    });

    it('should return Cannot find user', async () => {
        await request(app)
        .post('/api/users/login')
        .send({ email: 'doesn\'t exist', password: 'doesn\'t matter' })
        .expect(400)
    });
});

describe('DELETE /api/users/:id', () => {
    it('should delete the Test User', async () => {
        await request(app)
        .delete(`/api/users/${createdUser.id}`)
        .expect(204);
    });
});