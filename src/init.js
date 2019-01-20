/**
 * Init dotenv and init database model
 */

require('dotenv').load();
const mongoose = require('mongoose');
const Bluebird = require('bluebird');

mongoose.Promise = Bluebird;
mongoose.connect(process.env.MONGOOSE_CONNECTION_STRING, { useNewUrlParser: true });
