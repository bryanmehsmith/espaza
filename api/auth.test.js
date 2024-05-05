const request = require('supertest');
const express = require('express');
const app = express();
app.use(express.json());
app.use('/auth', require('./auth'));

describe('get /auth/isLoggedIn', () => {
    it('should return that the user is not logged in', async () => {
        await request(app)
        .get('/auth/isLoggedIn')
        .expect(200)
        .then(response => {
            expect(response.body.loggedIn).toBe(false);
        });
    });

    it('should return that the user is logged in', async () => {
        await request(app)
        .get('/auth/isLoggedIn')
        .set('Cookie', ['access_token=1234'])
        .expect(200)
        .then(response => {
            expect(response.body.loggedIn).toBe(true);
        });
    });
});

describe('get /auth/logout', () => {
    it('should log the user out', async () => {
        await request(app)
        .get('/auth/logout')
        .expect(200)
        .then(response => {
            expect(response.body.loggedOut).toBe(true);
        });
    });
});