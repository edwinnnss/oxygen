const Bluebird = require('bluebird');
const movieScrapper = require('./movie');

Bluebird.resolve()
  .then(async () => {
    await movieScrapper('film-series');
    await movieScrapper('movie');
  })
  .catch(console.log)
  .finally(() => process.exit(3));
