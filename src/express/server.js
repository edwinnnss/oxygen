require('../init');

const serverless = require('serverless-http');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

const movieRouters = require('../routes/movie');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // for now, enable all domain
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('combined'));

app.use('/movie', movieRouters);
app.use('/.netlify/functions/server', movieRouters);

app.listen(port, () => console.log(`Start application at http://localhost:${port}/movie`));

module.exports.handler = serverless(app);
