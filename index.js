const express = require('express');

const app = express();
app.use(express.json());

app.use('/', express.static('/home/site/wwwroot', {index: 'index.html'}));

const users = require('./api/users');
app.use('/users', users);

const products = require('./api/products');
app.use('/products', products);

port = process.env.PORT || 8080
app.listen(port, () => {
    console.log('Server is running on port ' + port);
});

module.exports = app;