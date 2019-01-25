const Bluebird = require('bluebird');
const Movie = require('../../database/models/movie');

module.exports = (req, res) => Bluebird.resolve()
  .then(async () => {
    const { slug } = req.params;
    const movie = await Movie
      .findOne({ slug })
      .lean();

    if (!movie) {
      return res.send(null);
    }

    return res.send(movie);
  })
  .catch(console.log);
