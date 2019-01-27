const Bluebird = require('bluebird');

const Movie = require('../../database/models/movie');
const { movieCache } = require('../../lru-caches');

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
