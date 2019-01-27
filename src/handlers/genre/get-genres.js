const Bluebird = require('bluebird');

const Movie = require('../../database/models/movie');
const { genresCache } = require('../../lru-caches');

module.exports = (req, res) => Bluebird.resolve()
  .then(async () => {
    let genres = genresCache.get('genres');

    if (genres) {
      return res.send(genres);
    }

    genres = await Movie
      .distinct('genres')
      .lean();

    if (!genres) {
      return res.send(null);
    }

    genresCache.set('genres', genres);

    return res.send(genres);
  })
  .catch(console.log);
