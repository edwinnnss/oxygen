const LRU = require('lru-cache');

const movieCache = new LRU(5000);
const moviesCache = new LRU(5000);
const genresCache = new LRU(10);
const distinctFieldCache = new LRU(10);

module.exports = {
  movieCache,
  moviesCache,
  genresCache,
  distinctFieldCache,
};
