const express = require('express');
const router = express.Router();
const fs = require('fs');

const dbDirPath = '../db';

// Check if the db directory exists, if not, create it
if (!fs.existsSync(dbDirPath)) {
    fs.mkdirSync(dbDirPath);
}

const productsFilePath = '../db/products.json';

// Check if the file exists, if not, create it
if (!fs.existsSync(productsFilePath)) {
    fs.writeFileSync(productsFilePath, JSON.stringify([]));
}

const products = require(productsFilePath);

if (process.env.NODE_ENV !== 'test' && process.env.npm_lifecycle_event !== 'start:watch') {
    setInterval(() => {
        fs.writeFile('./db/products.json', JSON.stringify(products), (err) => {
            if (err) {
                console.error('Error saving products to JSON file:', err);
            } else {
                console.log('Saved products to JSON file');
            }
        });
    }, 60000);
}

router.post('/', (req, res) => {
    if (!req.body.name || !req.body.serial || !req.body.price) {
        message = "";
        if (!req.body.name) message += "Name is required. ";
        if (!req.body.serial) message += "Serial is required. ";
        if (!req.body.price) message += "Price is required. ";
        res.status(400).json({ error: message });
        return;
    }
    const index = products.findIndex(product => product.serial === req.body.serial);
    if (index !== -1) {
        res.status(400).json({ error: 'Product already exists' });
        return;
    }
    const newProduct = {
        ...req.body
    };
    products.push(newProduct);
    const newIndex = products.findIndex(product => product.serial === req.body.serial);
    newProduct.id = newIndex;
    res.status(201).json(newProduct);
});

router.delete('/:id', (req, res) => {
    const index = products.findIndex(product => product.id === Number(req.params.id));
    products.splice(index, 1);
    res.status(204).json({ message: 'Product deleted successfully' });
});

router.get('/', (req, res) => {
    res.json(products);
});

router.get('/:id', (req, res) => {
    const product = products.find(product => product.id === Number(req.params.id));
    res.json(product);
});

module.exports = router;