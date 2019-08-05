const fs = require('fs');
const Bluebird = require('bluebird');
const getMovieFirstUrl = require('../src/lib/indoxx1/get-movie-first-url');

const types = ['movie', 'film-series'];

Bluebird.resolve()
  .then(async () => {
    await Bluebird.each(types, async (movieType) => {
      const firstPageSlugs = await getMovieFirstUrl(movieType);

      const movieUrlPath = `tmp/tmdb-${movieType}-urls.json`;
      const lastSlug = JSON.parse(fs.readFileSync(movieUrlPath, 'utf8'))[0];

      const indexFound = firstPageSlugs.indexOf(lastSlug);

      // if (indexFound === 0) { // nothing update
      //   return;
      // }
    });
  })
  .catch(console.log)
  .finally(() => process.exit(3));
