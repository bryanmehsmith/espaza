const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./db/espaza.db');

db.run(`
    CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY, 
        name TEXT, 
        description TEXT, 
        category TEXT, 
        price INTEGER,
        image TEXT
    )
`);

// Routes
router.get('/', async (req, res) => {
    const { search, price, category } = req.query;
    let query = "SELECT * FROM items";
    let params = [];

    let userId = req.user;

    if (search) {
        query += " WHERE (name LIKE ? OR description LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
    }

    if (price) {
        query += (params.length ? " AND" : " WHERE") + " price <= ?";
        params.push(price);
    }

    if (category) {
        query += (params.length ? " AND" : " WHERE") + " category = ?";
        params.push(category);
    }

    try {
        const items = await new Promise((resolve, reject) => {
            db.all(query, params, function(err, items) {
                if (err) reject(err);
                resolve(items);
            });
        });
        res.json({ userId, items});
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;