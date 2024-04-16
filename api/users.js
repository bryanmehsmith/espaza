const bcrypt = require('bcrypt');
const saltRounds = 10;

require('dotenv').config();
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dbDirPath = path.join(__dirname, '../db');

// Check if the db directory exists, if not, create it
if (!fs.existsSync(dbDirPath)) {
    fs.mkdirSync(dbDirPath);
}

const usersFilePath = path.join(__dirname, '../db/users.json');

// Check if the file exists, if not, create it
if (!fs.existsSync(usersFilePath)) {
    const defaultUser = {
        id: 0,
        name: "admin",
        email: "admin@espaza.net",
        password: "$2b$10$JH8n63OU2.N2kF/JwfNM8./0chyqVUiqplAsEslfWuXSLyvTUlR1q",
        role: "Shopper"
    };
    fs.writeFileSync(usersFilePath, JSON.stringify([defaultUser]));
}

const users = require(usersFilePath);

if (process.env.NODE_ENV !== 'test') {
    setInterval(() => {
        fs.writeFile(path.join(dir, 'db', 'users.json'), JSON.stringify(users), (err) => {
            if (err) {
                console.error('Error saving products to JSON file:', err);
            } else {
                console.log('Saved users to JSON file');
            }
        });
    }, 60000);
}

router.post('/register', (req, res) => {
    if (!req.body.email || !req.body.password || !req.body.name) {
        message = "";
        if (!req.body.email) message += "Email is required. ";
        if (!req.body.password) message += "Password is required. ";
        if (!req.body.name) message += "Name is required. ";
        res.status(400).json({ error: message });
        return;
    }
    email = req.body.email.toLowerCase()
    const index = users.findIndex(user => user.email === email);
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
                password: hash,
                role: 'Shopper'
            };
            users.push(newUser);
            const index = users.findIndex(user => user.email === email);
            newUser.id = index;
            const { password, ...userWithoutPassword } = newUser;
            res.status(201).json(userWithoutPassword);
        }
    });
});

router.delete('/:id', (req, res) => {
    const index = users.findIndex(user => user.id === Number(req.params.id));
    users.splice(index, 1);
    res.status(204).json({ message: 'User deleted successfully' });
});

router.get('/', (req, res) => {
    const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    });
    res.json(usersWithoutPasswords);
});

router.get('/:id', (req, res) => {
    const user = users.find(user => user.id === Number(req.params.id));
    if (user) {
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } else {
        res.status(400).json();
    }
});

router.post('/login', (req, res) => {
    const user = users.find(user => user.email === req.body.email.toLowerCase());
    if (user == null) {
        return res.status(400).send();
    }
    try {
        if (bcrypt.compareSync(req.body.password, user.password)) {
            const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, { expiresIn: '1h' });
            res.json({ token: token });
        }
    } catch {
        res.status(500).send();
    }
});

module.exports = router;