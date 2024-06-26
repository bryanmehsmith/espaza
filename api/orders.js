const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./db/espaza.db');

async function ensureLoggedIn(req, res, next) {
    /* istanbul ignore next */
    if (!req.user) {
        /* istanbul ignore next */
        res.status(404).json();
        /* istanbul ignore next */
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

    let query = "SELECT userId, itemId, cart.quantity, name, price FROM cart LEFT OUTER JOIN products ON cart.itemId = products.id WHERE userId = ?";
    let params = [userId];

    let cart = {};
    let orderId = -1;
    let totalPrice = 0;


    try {
        const items = await new Promise((resolve, reject) => {
            db.all(query, params, function(err, items) {
                /* istanbul ignore next */
                if (err) reject(err);
                resolve(items);
            });
        });
        cart = items;
    } catch (err) {
        /* istanbul ignore next */
        console.error(err.message);
        /* istanbul ignore next */
        res.status(500).json({ error: err.message });
        /* istanbul ignore next */
        return;
    }

    // If item found in the cart
    /* istanbul ignore next */
    if (cart.length > 0) {

        // Create an order with partial details, will update it later
        query = "INSERT INTO orders (userId) VALUES (?)";
        params = [userId];

        try {
            await new Promise((resolve, reject) => {
                db.run(query, params, function(err, items) {
                    /* istanbul ignore next */
                    if (err) reject(err);
                    orderId = this.lastID;
                    resolve(items);
                });
            });
        } catch (err) {
            /* istanbul ignore next */
            console.error(err.message);
            /* istanbul ignore next */
            res.status(500).json({ error: err.message });
            /* istanbul ignore next */
            return;
        }

        /* istanbul ignore next */
        if (orderId < 0) {
            /* istanbul ignore next */
            res.status(500).json({ message: "Can't create order" });
            /* istanbul ignore next */
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
                        /* istanbul ignore next */
                        if (err) reject(err);
                        resolve(items);
                    });
                });
                // Sum up the bill amount
                totalPrice += price * quantity;
            } catch (err) {
                /* istanbul ignore next */
                console.error(err.message);
                /* istanbul ignore next */
                res.status(500).json({ error: err.message });
                /* istanbul ignore next */
                return;
            }


            let updateQuery = "UPDATE products SET quantity = quantity - ? WHERE id =?";
    
            try {
                const items = new Promise((resolve, reject) => {
                    db.all(updateQuery, [quantity, itemId], function(err, items) {
                         /* istanbul ignore next */
                        if (err) reject(err);
                        resolve(items);
                    });
                });
            } catch (err) {
                 /* istanbul ignore next */
                console.error(err.message);
                 /* istanbul ignore next */
                res.status(500).json({ error: err.message });
            }

        });


        // Update the bill amount
        query = "UPDATE orders SET totalPrice =? WHERE userId =? AND id =?";
        params = [totalPrice, userId, orderId];
    
    
        try {
            const updatePromise = await new Promise((resolve, reject) => {
                db.all(query, params, function(err, updateItems) {
                    /* istanbul ignore next */
                    if (err) reject(err);
                    resolve(updateItems);
                });
            });
        } catch (err) {
            /* istanbul ignore next */
            console.error(err.message);
            /* istanbul ignore next */
            res.status(500).json({ error: err.message });
            /* istanbul ignore next */
            return;
        }


        // Delete what is left in the cart for the user
        query = "DELETE FROM cart WHERE userId =?";
        params = [userId];
    
    
        try {
            const updatePromise = await new Promise((resolve, reject) => {
                db.run(query, params, function(err, updateItems) {
                    /* istanbul ignore next */
                    if (err) reject(err);
                    //res.json({ message: 'Order placed'});
                    resolve(updateItems);
                });
            });
        } catch (err) {
            /* istanbul ignore next */
            console.error(err.message);
            /* istanbul ignore next */
            res.status(500).json({ error: err.message });
            /* istanbul ignore next */
            return;
        }
        
        // Send a notification to the user
        const id  = orderId;
        db.run("UPDATE orders SET paymentStatus = 'paid', status = 'packing' WHERE id = ?", [id], function(err) {
            /* istanbul ignore next */
            if (err) {
                return console.error(err.message);
            }
            
            const userId = req.user;
            const message = `Your order #${id} is now being Packed.`;
            db.run("INSERT INTO notifications (userId, orderId, message) VALUES (?, ?, ?)", [userId, id, message], function(err) {
                /* istanbul ignore next */
                if (err) {
                    return console.error(err.message);
                }
                res.json({ message: 'Payment successful, order is now being Packed' });
            });
        });

    } else {
        /* istanbul ignore next */
        res.status(500).json({ message: "Can't create order, no items" });
        /* istanbul ignore next */
        return;
    }

});

router.post('/add', ensureLoggedIn, async (req, res) => {
    const { orderId, itemId, quantity, price } = req.body;
    let userId = req.user;
    db.run("INSERT INTO order_items (userId, itemId, orderId, quantity, price) VALUES (?, ?, ?, ?, ?)", [userId, itemId, orderId, quantity, price], function(err) {
        /* istanbul ignore next */
        if (err) {
            return console.error(err.message);
        }
        // Return the orderId
        res.json({ message: 'Order placed', orderId: this.lastID });
    });
});

router.put('/update/:id', ensureLoggedIn, async (req, res) => {
    const id = req.params.id;
    let status = req.body.status;
    db.run("UPDATE orders SET status = ? WHERE id = ?", [status, id], function(err) {
        /* istanbul ignore next */
        if (err) {
            return console.error(err.message);
        }
        // Send a notification to the user
        const userId = req.user;
        const message = "Your order #" + id + " is now " + status + ".";
        db.run("INSERT INTO notifications (userId, orderId, message) VALUES (?, ?, ?)", [userId, id, message], function(err) {
            /* istanbul ignore next */
            if (err) {
                return console.error(err.message);
            }
             /* istanbul ignore next */
            res.json({ message: 'Order is now ' + status});
        });
    });
});

router.get('/', ensureLoggedIn, async (req, res) => {
    db.all("SELECT * FROM orders", (err, rows) => {
        /* istanbul ignore next */
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});

/* istanbul ignore next */
router.get('/items', ensureLoggedIn, async (req, res) => {
    /* istanbul ignore next */
    let userId = req.user;

    query = "SELECT rowid from orders order by ROWID DESC limit 1";
    params = [userId];

    let orderId = -1;

    try {
        await new Promise((resolve, reject) => {
            db.all(query, function(err, items) {
                /* istanbul ignore next */
                if (err) reject(err);
                orderId = items[0].id;
                resolve(items);
            });
        });
    } catch (err) {
        /* istanbul ignore next */
        console.error(err.message);
        /* istanbul ignore next */
        res.status(500).json({ error: err.message });
        /* istanbul ignore next */
        return;
    }

    db.all("SELECT * FROM order_items WHERE userId = ? AND orderId =?", [userId, orderId], (err, rows) => {
        /* istanbul ignore next */
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});

router.get('/:id', ensureLoggedIn, async (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM orders WHERE id = ?", [id], (err, row) => {
        /* istanbul ignore next */
        if (err) {
            throw err;
        }
        res.json(row);
    });
});

module.exports = router;
module.exports.ensureLoggedIn = ensureLoggedIn;