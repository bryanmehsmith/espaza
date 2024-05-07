const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./db/espaza.db');

async function ensureLoggedIn(req, res, next) {
    if (!req.user) {
        res.status(404).json();
        return;
    }
    next();
}

db.run(`
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY, 
        userId INTEGER, 
        itemId INTEGER, 
        totalPrice INTEGER,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending',
        paymentStatus TEXT DEFAULT 'unpaid',
        FOREIGN KEY(userId) REFERENCES users(id),
        FOREIGN KEY(itemId) REFERENCES items(id)
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY, 
        userId INTEGER, 
        itemId INTEGER, 
        orderId INTEGER, 
        quantity INTEGER, 
        price INTEGER,
        FOREIGN KEY(userId) REFERENCES users(id),
        FOREIGN KEY(itemId) REFERENCES items(id),
        FOREIGN KEY(itemId) REFERENCES orders(id)
    )
`);

// Routes
router.post('/create', ensureLoggedIn, async (req, res) => {
    //const { itemId, totalPrice } = req.body;
    let userId = req.user;
    db.run("INSERT INTO orders (userId) VALUES (?)", [userId], function(err) {
        if (err) {
            return console.error(err.message);
        }
        // Return the orderId
        res.json({ message: 'Order placed', orderId: this.lastID });
    });
});

router.post('/add', /*ensureLoggedIn,*/ async (req, res) => {
    const { orderId, itemId, quantity, price } = req.body;
    let userId = req.user;
    db.run("INSERT INTO order_items (userId, itemId, orderId, quantity, price) VALUES (?, ?, ?, ?, ?)", [userId, itemId, orderId, quantity, price], function(err) {
        if (err) {
            return console.error(err.message);
        }
        // Return the orderId
        res.json({ message: 'Order placed', orderId: this.lastID });
    });
});

router.put('/checkout/:id', ensureLoggedIn, async (req, res) => {
    const { id } = req.params;
    db.run("UPDATE orders SET paymentStatus = 'paid', status = 'packing' WHERE id = ?", [id], function(err) {
        if (err) {
            return console.error(err.message);
        }
        res.json({ message: 'Payment successful, order is now being packed' });
    });
});

router.get('/', ensureLoggedIn, async (req, res) => {
    let userId = req.user;
    db.all("SELECT * FROM orders WHERE userId = ?", [userId], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});

router.get('/orders/items', ensureLoggedIn, async (req, res) => {
    let userId = req.user;
    db.all("SELECT * FROM order_items WHERE userId = ?", [userId], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});

router.get('/:id', ensureLoggedIn, async (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM orders WHERE id = ?", [id], (err, row) => {
        if (err) {
            throw err;
        }
        res.json(row);
    });
});

module.exports = router;
module.exports.ensureLoggedIn = ensureLoggedIn;