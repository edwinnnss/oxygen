require('./init');

const express = require('express');
const bodyParser = require('body-parser');

const movieRouters = require('./routes/movie');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/movie', movieRouters);

app.listen(port, () => console.log(`Start application at http://localhost:${port}`));
