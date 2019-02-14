const Bluebird = require('bluebird');
const movieScrapper = require('./movie');

Bluebird.resolve()
  .then(async () => {
    await movieScrapper('film-semi');
    await movieScrapper('movie');
    await movieScrapper('film-seri');
  })
  .catch(console.log)
  .finally(() => process.exit(3));
