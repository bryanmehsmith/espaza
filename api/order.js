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
        quantity INTEGER,
        orderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending',
        paymentStatus TEXT DEFAULT 'unpaid',
        shippingAddress TEXT,
        FOREIGN KEY(userId) REFERENCES users(id),
        FOREIGN KEY(itemId) REFERENCES items(id)
    )
`);

// Routes
router.post('/create', /*ensureLoggedIn,*/ async (req, res) => {
    //const { userId, itemId, quantity, shippingAddress } = req.body;
    db.run("INSERT INTO orders (userId, itemId, quantity, shippingAddress) VALUES (?, ?, ?, ?)", [req.user, 0, 1, 'None'], function(err, rows) {
        if (err) {
            return console.error(err.message);
        }
        res.json({ message: 'Order placed', rows });
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