const bcrypt = require('bcrypt');
const saltRounds = 10;

const express = require('express');
const router = express.Router();

const products = require('../db/products.json');

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