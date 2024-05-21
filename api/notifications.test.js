const request = require('supertest');
const express = require('express');
const sqlite3 = require('sqlite3');
const notificationRoutes = require('./notifications');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  if (req.headers['x-user-id']) {
    req.user = req.headers['x-user-id'];
  }
  next();
});
app.use('/notifications', notificationRoutes);

let db;

beforeAll((done) => {
  db = new sqlite3.Database('./db/espaza.db');
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY,
      userId INTEGER,
      orderId INTEGER,
      message TEXT,
      isRead INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(orderId) REFERENCES orders(id)
    )`, done);
}, 20000);

afterAll((done) => {
  // Delete specific test notifications
  db.run('DELETE FROM notifications WHERE userId = ? AND orderId = ?', [1, 1], (err) => {
    if (err) {
      console.error('Error deleting test notifications:', err);
    }
    db.close(done);
  });
}, 10000);

describe('POST /notifications', () => {
  it('should create a new notification', async () => {
    const res = await request(app)
      .post('/notifications')
      .send({
        userId: 1,
        orderId: 1,
        message: 'Your order is being processed',
      })
      .set('x-user-id', '1');

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Notification created');
  });
});

describe('GET /notifications', () => {
  it('should get all notifications for a user', async () => {
    const res = await request(app)
      .get('/notifications')
      .set('x-user-id', '1');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});

describe('PUT /notifications/:id/read', () => {
  it('should mark a notification as read', async () => {
    // Create a new notification
    const newNotification = await request(app)
      .post('/notifications')
      .send({
        userId: 1,
        orderId: 1,
        message: 'Your order is being shipped',
      });

    const notificationId = newNotification.body.id;

    const res = await request(app)
      .put(`/notifications/${notificationId}/read`)
      .set('x-user-id', '1');

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Notification marked as read');
  });
});