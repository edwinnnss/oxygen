require('../../src/init');

const fs = require('fs');
const Bluebird = require('bluebird');

const movieQuery = require('../../src/database/queries/movie');

const getMovieUrls = require('../../src/lib/indoxx1/get-movie-urls');
const getMovie = require('../../src/lib/indoxx1/get-movie');

const utils = require('../../src/utils');

const movieUrlPath = 'tmp/tmdb-movie-urls.json';

if (!fs.existsSync('tmp')) {
  fs.mkdirSync('tmp');
}

Bluebird.resolve()
  .then(async () => {
    let slugs;
    let counter = 1;

    await utils.get('https://indoxxi.bz');

    if (fs.existsSync(movieUrlPath)) {
      console.log('Using temp file');
      slugs = JSON.parse(fs.readFileSync(movieUrlPath, 'utf8'));
    } else {
      slugs = await getMovieUrls();
      fs.writeFileSync(movieUrlPath, JSON.stringify(slugs, null, 2));
    }

    await Bluebird.each(slugs, async (slug) => {
      console.log(`${counter}/${slugs.length} | Extract data from ${slug}`);
      counter += 1;

      const movie = await getMovie(slug);

      await movieQuery.upsert(movie);
    });

    // const movie = await getMovie('https://indoxxi.bz/movie/this-is-my-year-2018-boo2/play');
    // console.log(movie);
  })
  .catch(console.log)
  .finally(() => process.exit(3));
