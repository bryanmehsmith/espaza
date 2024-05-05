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

const db = new sqlite3.Database('./db/products.db');
db.run("CREATE TABLE IF NOT EXISTS products (id TEXT, product_name TEXT, category TEXT, quantity INTEGER, price DOUBLE PRECISION, description TEXT, image TEXT)");

const { ensureInternal } = require('./users');

router.get('/', ensureInternal, async (req, res) => {
    try {
        const products = await new Promise((resolve, reject) => {
            db.all("SELECT id, product_name, category, quantity, price, image FROM products", function(err, products) {
                /* istanbul ignore next */
                if (err) reject(err);
                resolve(products);
            });
        });
        res.json({ products });
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
                    SET product_name = COALESCE(?, product_name),
                        category = COALESCE(?, category),
                        quantity = COALESCE(?, quantity),
                        price = COALESCE(?, price),
                        description = COALESCE(?, description)
                    WHERE id = ?`,
                [req.body.product_name, req.body.category, Number(req.body.quantity), Number(req.body.price), req.body.description, req.params.id],
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
        const { product_name, category, quantity, price, description } = req.body;
        if ( !product_name || !category || !quantity || !price ) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        if (!req.file) {
            imagePath = null;
        } else {
            imagePath = req.file.path;
        }

        await new Promise((resolve, reject) => {
            const sql = "INSERT INTO products (id, product_name, category, quantity, price, description, image) VALUES (?, ?, ?, ?, ?, ?, ?)";
            db.run(sql, [uuid.v4(), product_name, category, quantity, price, description, imagePath], function(err) {
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

module.exports = router;