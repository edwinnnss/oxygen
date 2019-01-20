const Bluebird = require('bluebird');
const Movie = require('../../database/models/movie');

const LIMIT = 15;

module.exports = (req, res) => Bluebird.resolve()
  .then(async () => {
    let { page } = req.query;

    if (!page) {
      page = 1;
    }

    console.log(page);

    const movies = await Movie
      .find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * LIMIT)
      .limit(LIMIT);

    return res.send(movies);
  })
  .catch(console.log);
