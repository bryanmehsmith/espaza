const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

function addHF(filePath) {
    const head = fs.readFileSync(path.join('/home/site/wwwroot', 'views', 'head.html'), 'utf8');
    const header = fs.readFileSync(path.join('/home/site/wwwroot', 'views', 'header.html'), 'utf8');
    const footer = fs.readFileSync(path.join('/home/site/wwwroot', 'views', 'footer.html'), 'utf8');
    const originalContent = fs.readFileSync(filePath, 'utf8');
    return head + header + originalContent + footer;
}

// app.use('/', express.static('/home/site/wwwroot', {index: 'index.html'}));
app.use(express.static(path.join('/home/site/wwwroot')));

// Routes
app.get('/', (req, res) => {res.send(addHF(path.join('/home/site/wwwroot', 'views', 'index.html')));});
app.get('/login', (req, res) => {res.send(addHF(path.join('/home/site/wwwroot', 'views', 'login.html')));});

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