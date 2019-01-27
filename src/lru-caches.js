const LRU = require('lru-cache');

const movieCache = new LRU(5000);
const movieListCache = new LRU(5000);

module.exports = {
  movieCache,
  movieListCache,
};
