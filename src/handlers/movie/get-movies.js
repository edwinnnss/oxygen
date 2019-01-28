const _ = require('lodash');
const Bluebird = require('bluebird');
const Movie = require('../../database/models/movie');

const { moviesCache } = require('../../lru-caches');

const LIMIT = 24;

_.mixin({
  compactObject: (o) => {
    _.each(o, (v, k) => {
      if (!v) {
        delete o[k];
      }
    });
    return o;
  },
});

const createYearsFilter = (str) => {
  if (str.indexOf(',') >= 0) {
    const splittedYears = _.map(str.split(','), _.toNumber);

    return {
      $in: splittedYears,
    };
  }

  if (str.indexOf('s') >= 0) {
    const year = _.chain(str)
      .replace(/[^0-9]/g, '')
      .toNumber()
      .value();

    const range = _.range(year, year + 10);

    return {
      $in: range,
    };
  }

  return str;
};

const createFilter = ({ genres, years, director, star, search, country }) => {
  const filter = {};

  if (genres) {
    const splittedGenres = genres.split(',');
    _.set(filter, 'genres', {
      $in: splittedGenres,
    });
  }

  if (years) {
    filter['released.year'] = createYearsFilter(years);
  }

  if (director) {
    filter['directors'] = director;
  }

  if (star) {
    filter['stars'] = star;
  }

  if (country) {
    filter['countries'] = country;
  }

  if (search) {
    filter['name'] = {
      $regex: search,
      $options: 'i',
    };
  }

  return _.compactObject(filter);
};

const createSortCriteria = ({ sortBy, sortDirection }) => {
  const sortCriteria = {};

  if (sortBy === 'ratingValue') {
    _.set(sortCriteria, 'ratingValue', sortDirection || -1);
  } else if (sortBy === 'latest') {
    sortCriteria['released.year'] = sortDirection || -1;
    sortCriteria['released.month'] = sortDirection || -1;
    sortCriteria['released.day'] = sortDirection || -1;
  }

  sortCriteria.name = -1;

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

    const cacheKey = page + JSON.stringify(filter) + JSON.stringify(sortCriteria);

    let movies = moviesCache.get(cacheKey);

    if (movies) {
      return res.send(movies);
    }

    movies = await Movie
      .find(filter)
      .select('countries coverImageUrl directors duration genres name posterUrl quality ratingCount ratingValue released slug stars')
      .sort(sortCriteria)
      .skip((page - 1) * LIMIT)
      .limit(LIMIT)
      .lean();

    moviesCache.set(cacheKey, movies);

    return res.send(movies);
  })
  .catch(console.log);
