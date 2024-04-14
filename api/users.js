const bcrypt = require('bcrypt');
const saltRounds = 10;

const express = require('express');
const router = express.Router();

const users = require('../db/users.json');

router.post('/', (req, res) => {
    if (!req.body.email || !req.body.password || !req.body.name) {
        message = "";
        if (!req.body.email) message += "Email is required. ";
        if (!req.body.password) message += "Password is required. ";
        if (!req.body.name) message += "Name is required. ";
        res.status(400).json({ error: message });
        return;
    }
    const index = users.findIndex(user => user.email === req.body.email);
    if (index !== -1) {
        res.status(400).json({ error: 'User already exists' });
        return;
    }
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        if (err) {
            res.status(500).json({ error: 'Failed to hash password' });
        } else {
            const newUser = {
                ...req.body,
                password: hash
            };
            users.push(newUser);
            delete newUser.password;
            const index = users.findIndex(user => user.email === req.body.email);
            newUser.id = index;
            res.status(201).json(newUser);
        }
    });
});

router.delete('/:id', (req, res) => {
    const index = users.findIndex(user => user.id === Number(req.params.id));
    users.splice(index, 1);
    res.status(204).json({ message: 'User deleted successfully' });
});

router.get('/', (req, res) => {
    res.json(users);
});

router.get('/:id', (req, res) => {
    const user = users.find(user => user.id === Number(req.params.id));
    res.json(user);
});

module.exports = router;