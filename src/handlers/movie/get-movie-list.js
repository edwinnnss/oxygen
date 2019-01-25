const _ = require('lodash');
const Bluebird = require('bluebird');
const Movie = require('../../database/models/movie');

const LIMIT = 15;

const createFilter = ({ genres, years }) => {
  const filter = {};

  if (genres) {
    const splittedGenres = genres.split(',');
    _.set(filter, 'genres', {
      $in: splittedGenres,
    });
  }

  if (years) {
    const splittedYears = _.map(years.split(','), _.toNumber);

    filter['released.year'] = {
      $in: splittedYears,
    };
  }

  return filter;
};

const createSortCriteria = ({ sortBy, sortDirection }) => {
  const sortCriteria = { createdAt: -1 };

  if (sortBy === 'ratingValue') {
    sortCriteria.ratingValue = sortDirection || -1;
  }

  return sortCriteria;
};

module.exports = (req, res) => Bluebird.resolve()
  .then(async () => {
    let { page } = req.query;

    if (!page) {
      page = 1;
    }

    const filter = createFilter(req.query);
    const sortCriteria = createSortCriteria(req.query);

    console.log(JSON.stringify(filter, null, 2));
    console.log(JSON.stringify(sortCriteria, null, 2));

    const movies = await Movie
      .find(filter)
      .sort(sortCriteria)
      .skip((page - 1) * LIMIT)
      .limit(LIMIT)
      .lean();

    return res.send(movies);
  })
  .catch(console.log);
