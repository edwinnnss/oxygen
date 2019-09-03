require('../src/init');

const _ = require('lodash');
const fs = require('fs');
const Bluebird = require('bluebird');
const Movie = require('../src/database/models/movie');

Bluebird.resolve()
  .then(async () => {
    const sources = await Movie.distinct('source', { type: 'movie' });

    const slugs = _.map(sources, source => source
      .replace('https://indoxx1.network', '')
      .replace('https://indoxx1.stream', ''));

    fs.writeFileSync('schedulers/movie-urls.json', JSON.stringify(slugs, null, 2));
  })
  .then(() => process.exit(0));
