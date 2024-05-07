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
app.use('/users', require('./users'));

let db;

beforeAll((done) => {
    db = new sqlite3.Database('./db/espaza.db');
    db.run("CREATE TABLE IF NOT EXISTS users (id TEXT, googleId TEXT, name TEXT, role TEXT)", () => {
        db.run('INSERT INTO users (id, role) VALUES (?, ?)', ['1', 'Shopper'], () => {
            db.run('INSERT INTO users (id, role) VALUES (?, ?)', ['2', 'Staff'], () => {
                db.run('INSERT INTO users (id, role) VALUES (?, ?)', ['3', 'Admin'], () => {
                    db.run('INSERT INTO users (id, role) VALUES (?, ?)', ['4', 'Shopper'], () => {
                        db.run('INSERT INTO users (id, role) VALUES (?, ?)', ['5', 'Shopper'], () => {
                            done();
                        });
                    });
                });
            });
        });
    });
}, 20000);

afterAll((done) => {
  db.run('DELETE FROM users where id = ?', ['1'], () => {
      db.run('DELETE FROM users where id = ?', ['2'], () => {
          db.run('DELETE FROM users where id = ?', ['3'], () => {
            db.run('DELETE FROM users where id = ?', ['4'], () => {
                db.run('DELETE FROM users where id = ?', ['5'], () => {
                    db.close(done);
                });
            });
          });
      });
  });
}, 10000);

describe('delete /users/:id', () => {
    it('should return error if no user', async () => {
        await request(app)
        .delete('/users/0')
        .expect(404)
    });

    it('should return error for non-existing user', async () => {
        await request(app)
        .delete('/users/0')
        .set('x-user-id', '0')
        .expect(404)
    });

    it('should return error for non-Admin user', async () => {
        await request(app)
        .delete('/users/1')
        .set('x-user-id', '1')
        .expect(404)
    });

    it('should delete the user', async () => {
        await request(app)
        .delete('/users/4')
        .set('x-user-id', '3')
        .expect(200)
    });

    it('should return error when deleting self', async () => {
        await request(app)
        .delete('/users/3')
        .set('x-user-id', '3')
        .expect(400)
    });
});

describe('get /users', () => {
    it('should return error if no user', async () => {
        await request(app)
        .get('/users')
        .expect(404)
    });

    it('should return error for non-Admin user', async () => {
        await request(app)
        .get('/users')
        .set('x-user-id', '1')
        .expect(404)
    });

    it('should return all users', async () => {
        await request(app)
        .get('/users')
        .set('x-user-id', '3')
        .expect(200)
        .then(response => {
            expect(response.body.users.length).toBeGreaterThanOrEqual(1);
        });
    });
});

describe('put /users/:id', () => {
    it('should return error if no user', async () => {
        await request(app)
        .put('/users/0')
        .expect(404)
    });

    it('should return error for non-Admin user', async () => {
        await request(app)
        .put('/users/1')
        .set('x-user-id', '1')
        .expect(404)
    });

    it('should return error for invalid role', async () => {
        await request(app)
        .put('/users/2')
        .set('x-user-id', '3')
        .send({ role: 'Invalid' })
        .expect(400)
    });

    it('should update the role of the user', async () => {
        await request(app)
        .put('/users/5')
        .set('x-user-id', '3')
        .send({ role: 'Shopper' })
        .expect(200)
    });

    it('should return error when updating self', async () => {
        await request(app)
        .put('/users/3')
        .set('x-user-id', '3')
        .send({ role: 'Shopper' })
        .expect(400)
    });
});

describe('get /me', () => {
    it('should return error if no user', async () => {
        await request(app)
        .get('/users/me')
        .expect(404)
    });

    it('should return error for non-existing user', async () => {
        await request(app)
        .get('/users/me')
        .set('x-user-id', '0')
        .expect(404)
    });

    it('should return error for non-staff user', async () => {
        await request(app)
        .get('/users/me')
        .set('x-user-id', '1')
        .expect(404)
    });

    it('should return the user', async () => {
        await request(app)
        .get('/users/me')
        .set('x-user-id', '2')
        .expect(200)
        .then(response => {
            expect(response.body.user.id).toBe('2');
            expect(response.body.user.role).toBe('Staff');
        });
    });
});

describe('get /self/userRole', () => {
    it('should return error if no user', async () => {
        await request(app)
        .get('/users/self/userRole')
        .expect(404)
    });

    it('should return error for non-existing user', async () => {
        await request(app)
        .get('/users/self/userRole')
        .set('x-user-id', '0')
        .expect(404)
    });

    it('should return the role of the Shopper user', async () => {
        await request(app)
        .get('/users/self/userRole')
        .set('x-user-id', '1')
        .expect(200)
        .then(response => {
            expect(response.body.role).toBe('Shopper');
        });
    });

    it('should return the role of the Staff user', async () => {
        await request(app)
        .get('/users/self/userRole')
        .set('x-user-id', '2')
        .expect(200)
        .then(response => {
            expect(response.body.role).toBe('Staff');
        });
    });

    it('should return the role of the Admin user', async () => {
        await request(app)
        .get('/users/self/userRole')
        .set('x-user-id', '3')
        .expect(200)
        .then(response => {
            expect(response.body.role).toBe('Admin');
        });
    });
});