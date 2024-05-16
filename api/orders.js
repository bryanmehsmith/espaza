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
        totalPrice INTEGER,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending',
        paymentStatus TEXT DEFAULT 'paid',
        FOREIGN KEY(userId) REFERENCES users(id)
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY, 
        userId INTEGER, 
        itemId INTEGER,
        name TEXT,
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

    let userId = req.user;

    let query = "SELECT userId, itemId, quantity, name, price FROM cart LEFT OUTER JOIN items ON cart.itemId = items.id WHERE userId = ?";
    let params = [userId];

    let cart = {};
    let orderId = -1;
    let totalPrice = 0;


    try {
        const items = await new Promise((resolve, reject) => {
            db.all(query, params, function(err, items) {
                if (err) reject(err);
                resolve(items);
            });
        });
        cart = items;
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
        return;
    }

    // If item found in the cart
    if (cart.length > 0) {

        // Create an order with partial details, will update it later
        query = "INSERT INTO orders (userId) VALUES (?)";
        params = [userId];

        try {
            await new Promise((resolve, reject) => {
                db.run(query, params, function(err, items) {
                    if (err) reject(err);
                    orderId = this.lastID;
                    resolve(items);
                });
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
            return;
        }

        if (orderId < 0) {
            res.status(500).json({ message: "Can't create order" });
            return;
        }


        // Add items to an order 
        query = "INSERT INTO order_items (userId, itemId, name, orderId, quantity, price) VALUES (?, ?, ?, ?, ?, ?)";
        params = [];

        cart.forEach(item => {

            let { userId, itemId, quantity, name, price } = item;
            params = [userId, itemId, name, orderId, quantity, price];

            try {
                new Promise((resolve, reject) => {
                    db.run(query, params, function(err, items) {
                        if (err) reject(err);
                        resolve(items);
                    });
                });
                // Sum up the bill amount
                totalPrice += price * quantity;
            } catch (err) {
                console.error(err.message);
                res.status(500).json({ error: err.message });
                return;
            }

        });


        // Update the bill amount
        query = "UPDATE orders SET totalPrice =? WHERE userId =? AND id =?";
        params = [totalPrice, userId, orderId];


        try {
            const updatePromise = await new Promise((resolve, reject) => {
                db.all(query, params, function(err, updateItems) {
                    if (err) reject(err);
                    resolve(updateItems);
                });
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
            return;
        }


        // Delete what is left in the cart for the user
        query = "DELETE FROM cart WHERE userId =?";
        params = [userId];


        try {
            const updatePromise = await new Promise((resolve, reject) => {
                db.run(query, params, function(err, updateItems) {
                    if (err) reject(err);
                    res.json({ message: 'Order placed'});
                    resolve(updateItems);
                });
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
            return;
        }


    } else {
        res.status(500).json({ message: "Can't create order, no items" });
        return;
    }

});

router.post('/add', ensureLoggedIn, async (req, res) => {
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

router.put('/checkout/:id', /*ensureLoggedIn,*/ async (req, res) => {
    const { id } = req.params;
    db.run("UPDATE orders SET paymentStatus = 'paid', status = 'packing' WHERE id = ?", [id], function(err) {
        if (err) {
            return console.error(err.message);
        }
        // Send a notification to the user
        const userId = '6cddb75d-9a62-4904-886e-7ddab60857a9'
        //const userId = req.user;
        const message = `Your order #${id} is now being packed.`;
        db.run("INSERT INTO notifications (userId, orderId, message) VALUES (?, ?, ?)", [userId, id, message], function(err) {
            if (err) {
                return console.error(err.message);
            }
            res.json({ message: 'Payment successful, order is now being packed' });
        });
    });
});

router.get('/', ensureLoggedIn, async (req, res) => {
    db.all("SELECT * FROM orders", (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});

router.get('/items', ensureLoggedIn, async (req, res) => {
    let userId = req.user;

    query = "SELECT rowid from orders order by ROWID DESC limit 1";
    params = [userId];

    let orderId = -1;

    try {
        await new Promise((resolve, reject) => {
            db.all(query, function(err, items) {
                if (err) reject(err);
                orderId = items[0].id;
                resolve(items);
            });
        });
        //res.json({ userId, items});
        //orderId = this.lastID;
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
        return;
    }

    db.all("SELECT * FROM order_items WHERE userId = ? AND orderId =?", [userId, orderId], (err, rows) => {
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