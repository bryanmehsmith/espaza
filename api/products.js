const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const uuid = require('uuid');
const multer  = require('multer');
require('dotenv').config();

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, uuid.v4() + '_' + file.originalname)
    }
})

const upload = multer({ storage: storage });

/* istanbul ignore next */
if (!fs.existsSync('./uploads')){fs.mkdirSync('./uploads');}
/* istanbul ignore next */
if (!fs.existsSync('./db')){fs.mkdirSync('./db');}

const db = new sqlite3.Database('./db/espaza.db');
db.run("CREATE TABLE IF NOT EXISTS products (id TEXT, name TEXT, category TEXT, quantity INTEGER, price DOUBLE PRECISION, description TEXT, image TEXT)");

const { ensureInternal } = require('./users');

router.get('/', async (req, res) => {
    const { search, price, category } = req.query;
    let params = [];

    const user = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE id = ?", req.user, function(err, user) {
            /* istanbul ignore next */
            if (err) reject(err);
            resolve(user);
        });
    });

    let userId = req.user;

    let query;
    const roles = ['Admin', 'Staff'];
    if (user && roles.includes(user.role)) {
        query = "SELECT id, name, category, quantity, price, description, image FROM products";
    } else {
        query = "SELECT id, name, category, price, description, image FROM products"
    }

    if (search) {
        query += " WHERE (lower(name) LIKE lower(?) OR lower(description) LIKE lower(?))";
        params.push(`%${search}%`, `%${search}%`);
    }

    if (price) {
        query += (params.length ? " AND" : " WHERE") + " price <= ?";
        params.push(price);
    }

    if (category) {
        query += (params.length ? " AND" : " WHERE") + " lower(category) = lower(?)";
        params.push(category);
    }

    try {
        const products = await new Promise((resolve, reject) => {
            db.all(query, params, function(err, products) {
                /* istanbul ignore next */
                if (err) reject(err);
                resolve(products);
            });
        });
        res.json({ userId, products });
    } catch (err) {
        /* istanbul ignore next */
        console.error(err.message);
        /* istanbul ignore next */
        res.status(500).json({ message: 'An error occurred' });
    }
});

router.put('/:id', ensureInternal, async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            db.run(`UPDATE products
                    SET name = COALESCE(?, name),
                        category = COALESCE(?, category),
                        quantity = COALESCE(?, quantity),
                        price = COALESCE(?, price),
                        description = COALESCE(?, description)
                    WHERE id = ?`,
                [req.body.name, req.body.category, Number(req.body.quantity), Number(req.body.price), req.body.description, req.params.id],
                function(err) {
                    /* istanbul ignore next */
                if (err) reject(err);
                resolve();
            });
        });
        res.json({ message: 'Product updated successfully' });
    } catch (err) {
        /* istanbul ignore next */
        console.error(err.message);
        /* istanbul ignore next */
        res.status(500).json({ message: 'An error occurred' });
    }
});

router.delete('/:id', ensureInternal, async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            db.run("DELETE FROM products WHERE id = ?", req.params.id, function(err) {
                /* istanbul ignore next */
                if (err) reject(err);
                resolve();
            });
        });
        res.status(200).send({ message: 'Product deleted successfully' });
    } catch (err) {
        /* istanbul ignore next */
        console.error(err.message);
        /* istanbul ignore next */
        res.status(500).json({ message: 'An error occurred' });
    }
});

router.post('/', ensureInternal, upload.single('formFile'), async (req, res) => {
    try {
        const { name, category, quantity, price, description } = req.body;
        if ( !name || !category || !quantity || !price ) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        if (!req.file) {
            imagePath = null;
        } else {
            imagePath = req.file.path;
        }

        await new Promise((resolve, reject) => {
            const sql = "INSERT INTO products (id, name, category, quantity, price, description, image) VALUES (?, ?, ?, ?, ?, ?, ?)";
            db.run(sql, [uuid.v4(), name, category, quantity, price, description, imagePath], function(err) {
                /* istanbul ignore next */
                if (err) reject(err);
                resolve();
            });
        });

        res.status(201).json({ message: 'Product added successfully' });
    } catch (err) {
        /* istanbul ignore next */
        console.error(err.message);
        /* istanbul ignore next */
        res.status(500).json({ message: 'An error occurred' });
    }
});

router.post('/search', async (req, res) => {
    const { search, price, category } = req.body;
    let query = "SELECT * FROM products";
    let params = [];

    let userId = req.user;
    let search1 = req.params.id;

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