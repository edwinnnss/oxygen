const Bluebird = require('bluebird');
const LRU = require('lru-cache');

const Movie = require('../../database/models/movie');

const { DAY } = require('../../constants');

const movieCache = new LRU({
  max: 5000,
  maxAge: DAY,
});

module.exports = (req, res) => Bluebird.resolve()
  .then(async () => {
    const { slug } = req.params;

    let movie = movieCache.get(slug);

    if (movie) {
      return res.send(movie);
    }

    movie = await Movie
      .findOne({ slug })
      .lean();

    if (!movie) {
      return res.send(null);
    }

    movieCache.set(slug, movie);

    return res.send(movie);
  })
  .catch(console.log);
