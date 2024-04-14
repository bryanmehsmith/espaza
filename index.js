const express = require('express');

const app = express();
app.use('/', express.static('/home/site/wwwroot', {index: 'index.html'}));
app.listen(process.env.PORT);

app.use(express.json());