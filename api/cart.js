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
    CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY, 
        userId INTEGER, 
        itemId INTEGER, 
        quantity INTEGER,
        bill INTEGER,
        FOREIGN KEY(userId) REFERENCES users(id),
        FOREIGN KEY(itemId) REFERENCES items(id)
    )
`);

router.post('/add', ensureLoggedIn, async (req, res) => {
    const { userId, itemId, quantity } = req.body;

    let query = "SELECT * FROM cart WHERE userId =? AND itemId =?";
    let params = [];
    params.push(`${userId}`, `${itemId}`);

    let cart = {};


    try {
        const items = await new Promise((resolve, reject) => {
            db.all(query, params, function(err, items) {
                if (err) reject(err);
                resolve(items);
            });
        });
        //res.json({ userId, items});
        cart = items;
    } catch (err) {
        console.error(err.message);
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
                    if (err) reject(err);
                    resolve(items);
                });
            });
            res.json({ userId, items});
            //cart = items;
        } catch (err) {
            console.error(err.message);
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
                    if (err) reject(err);
                    resolve(items);
                });
            });

            res.json({ userId, items});
            //cart = items;
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
        }
    }
});  

router.delete('/remove/:id', /*ensureLoggedIn,*/ async (req, res) => {
    let itemId = req.params.id;
    let userId = req.user;

    try {

        db.serialize(()=>{
        new Promise((resolve, reject) => {
            db.run('DELETE FROM cart WHERE itemId = ?', [itemId], function(err) {
                if (err) reject(err);
                resolve();
            });
        });
        res.status(200).send({ message: 'Item removed from cart' });
    });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'An error occurred' });
    }
});

router.get('/items', ensureLoggedIn, async (req, res) => {
    let userId = req.user;
    
    // SELECT * FROM cart WHERE userId = ?
    let query = "SELECT userId, itemId, quantity, name, price FROM cart LEFT OUTER JOIN items ON cart.itemId = items.id WHERE userId = ?"
    db.all(query, [userId], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});

module.exports = router;
module.exports.ensureLoggedIn = ensureLoggedIn;