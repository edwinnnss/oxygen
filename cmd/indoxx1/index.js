const Bluebird = require('bluebird');
const movieScrapper = require('./movie');

Bluebird.resolve()
  .then(async () => {
    await movieScrapper('movie');
    await movieScrapper('film-semi');
    await movieScrapper('film-series');
  })
  .catch(console.log)
  .finally(() => process.exit(3));
