// const movieScrapper = require('../cmd/indoxx1/movie');
require('../src/init');
const _ = require('lodash');
const fs = require('fs');

const Bluebird = require('bluebird');
const getMovieUrls = require('../src/lib/indoxx1/get-movie-urls');
const getMovie = require('../src/lib/indoxx1/get-movie');
const movieQuery = require('../src/database/queries/movie');

const movieType = 'film-series';

Bluebird.resolve()
  .then(async () => {
    const problematicUrls = [];

    const oldSlugs = JSON.parse(fs.readFileSync('schedulers/film-series.json', 'utf8'));

    const newSlugs = await getMovieUrls(movieType);

    const diffSlugs = _.difference(newSlugs, oldSlugs);

    fs.writeFileSync('schedulers/diff-film-series.json', JSON.stringify(diffSlugs, null, 2));

    let counter = 1;

    await Bluebird.map(diffSlugs, async (slug) => {
      console.log(`${counter}/${diffSlugs.length} | Extract data from ${slug}`);

      counter += 1;

      let tryAgain = 5;

      while (tryAgain) {
        try {
          const movie = await getMovie(slug, movieType, true);

          if (movie) {
            await movieQuery.upsert(movie);
          }

          tryAgain = 0;
        } catch (error) {
          tryAgain -= 1;

          if (!tryAgain) {
            problematicUrls.push(slug);
          }

          console.log(`[${tryAgain}/5] Try again with error ${JSON.stringify(error, null, 2)}`);
        }
      }
    }, { concurrency: 20 });

    fs.writeFileSync('schedulers/problematicUrls-film-series.json', JSON.stringify(problematicUrls, null, 2));
    fs.writeFileSync('schedulers/film-series.json', JSON.stringify(newSlugs, null, 2));
  });
