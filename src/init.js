/**
 * Init dotenv and init database model
 */
const mongoose = require('mongoose');
const Bluebird = require('bluebird');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../.env' });

mongoose.Promise = Bluebird;
mongoose.connect(process.env.MONGOOSE_CONNECTION_STRING, { useNewUrlParser: true })
  .then(() => {
    console.log('Database connected to', process.env.MONGOOSE_CONNECTION_STRING);
  });
