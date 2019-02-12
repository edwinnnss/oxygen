const _ = require('lodash');
const Bluebird = require('bluebird');
const Movie = require('../../database/models/movie');

const { moviesCache } = require('../../lru-caches');

const MAX_LIMIT = 24;

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

const createFilter = ({ genres, years, director, star, search, country, type }) => {
  const filter = {};

  if (genres) {
    const splittedGenres = genres.split(',');
    filter['genres.slug'] = {
      $in: splittedGenres,
    };
  }

  if (years) {
    filter['released.year'] = createYearsFilter(years);
  }

  if (director) {
    filter['directors.slug'] = director;
  }

  if (star) {
    filter['stars.slug'] = star;
  }

  if (country) {
    filter['countries.slug'] = country;
  }

  if (search) {
    filter['name'] = {
      $regex: search,
      $options: 'i',
    };
  }

  if (type) {
    filter['type'] = type || 'movie';
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

const getNumber = (rawNum, defaultNumber) => {
  if (!rawNum) {
    return defaultNumber;
  }

  const number = _.toNumber(rawNum);

  if (_.isNaN(number)) {
    return defaultNumber;
  }

  return number;
};

module.exports = (req, res) => Bluebird.resolve()
  .then(async () => {
    let limit = getNumber(req.query.limit, MAX_LIMIT);
    const page = getNumber(req.query.page, 1);
    const filter = createFilter(req.query);
    const sortCriteria = createSortCriteria(req.query);

    if (limit >= MAX_LIMIT) {
      limit = MAX_LIMIT;
    }

    const cacheKey = page + limit + JSON.stringify(filter) + JSON.stringify(sortCriteria);

    let movies = moviesCache.get(cacheKey);

    if (movies) {
      return res.send(movies);
    }

    movies = await Movie
      .find(filter)
      .select('countries coverImageUrl directors duration genres name posterUrl quality ratingCount ratingValue released slug stars')
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    moviesCache.set(cacheKey, movies);

    return res.send(movies);
  })
  .catch(console.log);
