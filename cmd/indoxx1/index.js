const Bluebird = require('bluebird');
const movieScrapper = require('./movie');

Bluebird.resolve()
  .then(async () => {
    // await movieScrapper('film-series', true);
    await movieScrapper('movie', true);
    // await movieScrapper('film-semi', true);
  })
  .catch(console.log)
  .finally(() => process.exit(3));
