const Bluebird = require('bluebird');
const Movie = require('../models/movie');

exports.upsert = async movieObject => Bluebird.resolve()
  .then(async () => {
    const { source } = movieObject;
    const product = await Movie.findOne({ source });

    if (product) {
      product.set(movieObject);

      return product.save();
    }

    return Movie.create(movieObject);
  });
