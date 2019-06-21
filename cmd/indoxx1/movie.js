require('../../src/init');

const fs = require('fs');
const Bluebird = require('bluebird');

const movieQuery = require('../../src/database/queries/movie');

const getMovieUrls = require('../../src/lib/indoxx1/get-movie-urls');
const getMovie = require('../../src/lib/indoxx1/get-movie');

const utils = require('../../src/utils');

if (!fs.existsSync('tmp')) {
  fs.mkdirSync('tmp');
}

module.exports = (movieType, shouldExtractMetaData = false) => Bluebird.resolve()
  .then(async () => {
    let slugs;
    let counter = 1;

    await utils.get('https://indoxxi.studio');

    const problematicUrls = [];
    const movieUrlPath = `tmp/tmdb-${movieType}-urls.json`;

    if (fs.existsSync(movieUrlPath)) {
      console.log('Using temp file');
      slugs = JSON.parse(fs.readFileSync(movieUrlPath, 'utf8'));
    } else {
      slugs = await getMovieUrls(movieType);
      fs.writeFileSync(movieUrlPath, JSON.stringify(slugs, null, 2));
    }

    await Bluebird.map(slugs, async (slug) => {
      console.log(`${counter}/${slugs.length} | Extract data from ${slug}`);
      counter += 1;

      let tryAgain = 5;

      while (tryAgain) {
        try {
          const movie = await getMovie(slug, movieType, shouldExtractMetaData);

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

    fs.writeFileSync(`problematicUrls-${movieType}.json`, JSON.stringify(problematicUrls, null, 2));
  });
