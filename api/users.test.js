const request = require('supertest');
const express = require('express');
const app = express();
app.use(express.json());
app.use('/users', require('./users'));

// TODO: Add users api

// Doesn't work with Google OAuth
// beforeEach(async () => {
//     newUser = {
//         name: 'Test User',
//         email: 'testuser@example.com',
//         password: 'testpassword'
//     };
//     const response = await request(app).post('/api/users/register').send(newUser);
//     createdUser = response.body;
// });

// Doesn't work with Google OAuth
// afterEach(async () => {
//     await request(app).delete(`/api/users/${createdUser.id}`);
// });

describe('get /self/userRole', () => {
    it('should return the role of the user', async () => {
        await request(app)
        .get('/users/self/userRole')
        .expect(200)
        .then(response => {
            expect(response.body.role).toBe('Admin');
        });
    });
});