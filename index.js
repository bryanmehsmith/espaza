const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

dir = __dirname || '/home/site/wwwroot';

function addHF(filePath) {
    const head = fs.readFileSync(path.join(dir, 'views', 'head.html'), 'utf8');
    const header = fs.readFileSync(path.join(dir, 'views', 'header.html'), 'utf8');
    const footer = fs.readFileSync(path.join(dir, 'views', 'footer.html'), 'utf8');
    const originalContent = fs.readFileSync(filePath, 'utf8');
    return head + header + originalContent + footer;
}

// app.use('/', express.static('/home/site/wwwroot', {index: 'index.html'}));
app.use(express.static(path.join(dir)));

// Routes
app.get('/', (req, res) => {res.send(addHF(path.join(dir, 'views', 'index.html')));});
app.get('/login', (req, res) => {res.send(addHF(path.join(dir, 'views', 'login.html')));});

// API routes
const users = require('./api/users');
app.use('/api/users', users);

const products = require('./api/products');
app.use('/api/products', products);

port = process.env.PORT || 8080
app.listen(port, () => {
    console.log('Server is running on port ' + port);
});

module.exports = app;