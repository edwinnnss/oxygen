const _ = require('lodash');
const Bluebird = require('bluebird');

const Movie = require('../../database/models/movie');
const { distinctFieldCache } = require('../../lru-caches');

const filterField = ['movies', 'stars', 'directors', 'countries'];

module.exports = (req, res) => Bluebird.resolve()
  .then(async () => {
    if (!_.includes(filterField, req.params.field)) {
      return res.send(null);
    }

    let results = distinctFieldCache.get(req.params.field);

    if (results) {
      return res.send(results);
    }

    const criteriaDistinct = req.params.field === 'movies'
      ? 'slug' : `${req.params.field}.slug`;

    results = await Movie
      .distinct(criteriaDistinct)
      .lean();

    if (!results) {
      return res.send(null);
    }

    distinctFieldCache.set('results', results);

    return res.send(results);
  })
  .catch(console.log);
