const Bluebird = require('bluebird');

const Movie = require('../src/database/models/movie');

Bluebird.resolve()
  .then(async () => {
    await Movie.createIndexes(
      { 'slug': 1 },
    );

    await Movie.createIndexes(
      { 'released.year': 1 },
    );

    await Movie.createIndexes(
      { 'released.year': 1 },
      { 'released.month': 1 },
      { 'released.day': 1 },
    );

    console.log('Done');
  })
  .then(console.log)
  .finally(() => process.exit(3));
