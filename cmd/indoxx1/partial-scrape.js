require('../../src/init');

const fs = require('fs');
const Bluebird = require('bluebird');

const movieQuery = require('../../src/database/queries/movie');

const getMovie = require('../../src/lib/indoxx1/get-movie');

if (!fs.existsSync('tmp')) {
  fs.mkdirSync('tmp');
}

const partialScrape = movieType => Bluebird.resolve()
  .then(async () => {
    // const slugs = JSON.parse(fs.readFileSync('problematicUrls-film-series.json', 'utf8'));
    const slugs = [
      '/film-seri/mrs-wilson-season-1-2019-1oxls1',
      '/film-seri/proven-innocent-season-1-2019-1r86s1',
    ];

    let counter = 1;

    await Bluebird.map(slugs, async (slug) => {
      console.log(`${counter}/${slugs.length} | Extract data from ${slug}`);
      counter += 1;

      let tryAgain = 5;

      while (tryAgain) {
        try {
          const movie = await getMovie(slug, movieType);

          if (movie) {
            await movieQuery.upsert(movie);
          }

          tryAgain = 0;
        } catch (error) {
          tryAgain -= 1;

          console.log(`[${tryAgain}/5] Try again with error ${JSON.stringify(error, null, 2)}`);
        }
      }
    }, { concurrency: 5 });
  });

Bluebird.resolve()
  .then(async () => {
    await partialScrape('film-series');
    process.exit(3);
  });
