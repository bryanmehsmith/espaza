const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./db/espaza.db');

const { ensureExists, ensureInternal } = require('./users');

db.run(`
    CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY,
        userId INTEGER,
        itemId INTEGER,
        quantity INTEGER,
        FOREIGN KEY(userId) REFERENCES users(id),
        FOREIGN KEY(itemId) REFERENCES items(id)
    )
`);

router.post('/', ensureExists, async (req, res) => {
    const { itemId, quantity } = req.body;
    const userId = req.user

    let query = "SELECT id, userId, itemId, quantity FROM cart WHERE userId =? AND itemId =?";
    let params = [userId, itemId];

    let cart = {};

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
    }

    // If item found in the cart
    if (cart.length > 0) {
        query = "UPDATE cart SET quantity = quantity + 1 WHERE itemId =?";
        params = [];
        params.push(itemId);

        try {
            const items = await new Promise((resolve, reject) => {
                db.all(query, params, function(err, items) {
                     /* istanbul ignore next */
                    if (err) reject(err);
                    resolve(items);
                });
            });
            res.json({ userId, items});
            //cart = items;
        } catch (err) {
             /* istanbul ignore next */
            console.error(err.message);
             /* istanbul ignore next */
            res.status(500).json({ error: err.message });
        }

    } else {
        query = "INSERT INTO cart (userId, itemId, quantity) VALUES (?, ?, ?)";
        params = [];
        params.push(userId);
        params.push(itemId);
        params.push(quantity);

        try {
            const items = await new Promise((resolve, reject) => {
                db.all(query, params, function(err, items) {
                     /* istanbul ignore next */
                    if (err) reject(err);
                    resolve(items);
                });
            });

            res.json({ userId, items});
            //cart = items;
        } catch (err) {
             /* istanbul ignore next */
            console.error(err.message);
             /* istanbul ignore next */
            res.status(500).json({ error: err.message });
        }
    }
});

router.delete('/:id', ensureExists, async (req, res) => {
    let itemId = req.params.id;

    try {
        await new Promise((resolve, reject) => {
            db.run("DELETE FROM cart WHERE itemId = ? and userId = ?", [itemId, req.user], function(err) {
                /* istanbul ignore next */
                if (err) reject(err);
                resolve();
            });
        });
        res.status(200).send({ message: 'Item removed from cart' });
    } catch (err) {
         /* istanbul ignore next */
        console.error(err.message);
         /* istanbul ignore next */
        res.status(500).json({ message: 'An error occurred' });
    }
});

router.get('/items', ensureExists, async (req, res) => {
    let userId = req.user;

    let query = "SELECT cart.id, userId, itemId, cart.quantity, name, price FROM cart LEFT OUTER JOIN products ON cart.itemId = products.id WHERE userId = ?"
    db.all(query, [userId], (err, rows) => {
        /* istanbul ignore next */
        if (err) {throw err;}
        res.json(rows);
    });
});

router.put('/:id', ensureExists, async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            db.run(`UPDATE cart SET quantity = COALESCE(?, quantity) WHERE itemId = ? and userId = ?`, [Number(req.body.quantity), req.params.id, req.user],
                function(err) {
                /* istanbul ignore next */
                if (err) reject(err);
                resolve();
            });
        });
        res.json({ message: 'Cart updated successfully' });
    } catch (err) {
        /* istanbul ignore next */
        console.error(err.message);
        /* istanbul ignore next */
        res.status(500).json({ message: 'An error occurred' });
    }
});

router.get('/items/:id', ensureInternal, async (req, res) => {
    let itemId = req.params.id;

    let query = "SELECT id, userId, itemId, quantity FROM cart WHERE userId = ?"
    db.all(query, [itemId], (err, rows) => {
        /* istanbul ignore next */
        if (err) { throw err}
        res.json(rows);
    });
});

module.exports = router;