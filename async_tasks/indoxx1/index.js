require('../../src/init');

const fs = require('fs');
const Bluebird = require('bluebird');

const Movie = require('../../src/database/models/movie');
const movieQuery = require('../../src/database/queries/movie');

const getMovieUrls = require('../../src/lib/indoxx1/get-movie-urls');
const getMovie = require('../../src/lib/indoxx1/get-movie');

const utils = require('../../src/utils');

const movieUrlPath = 'tmp/tmdb-movie-urls.json';

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

      const checkMovie = await Movie.findOne({
        source: `https://indoxxi.bz${slug}`,
      });

      if (checkMovie) {
        return;
      }

      let tryAgain = true;

      while (tryAgain) {
        try {
          const movie = await getMovie(slug);
          await movieQuery.upsert(movie);
          tryAgain = false;
        } catch (error) {
          console.log('Try again leh', JSON.stringify(error, null, 2));
        }
      }
    });

    // const movie = await getMovie('/movie/bad-genius-2017-9rmq');
    // console.log(movie);
  })
  .catch(console.log)
  .finally(() => process.exit(3));
