const Bluebird = require('bluebird');
const cheerio = require('cheerio');
const fs = require('fs');

const utils = require('../../utils');

const indoxxiUrls = [
  'https://indoxxi.bz/films',
  'https://indoxxi.bz/muvi',
  'https://indoxxi.bz/tv',
];

const getMovieUrls = async () => {
  const movieUrlSet = new Set();

  await Bluebird.each(indoxxiUrls, async (indoxxiUrl) => {
    let shouldNext = true;

    let page = 1;

    do {
      let url;

      if (page === 1) {
        url = indoxxiUrl;
      } else {
        url = `${indoxxiUrl}/${page}`;
      }

      console.log(`${movieUrlSet.size} | Start ${url}`);

      const response = await utils.get(url);

      const $ = cheerio.load(response.text);

      const entries = $('#movie-featured div a').length;

      if (entries > 0) {
        $('#movie-featured div a').each((index, elem) => {
          const movieUrl = $(elem).attr('href');

          movieUrlSet.add(movieUrl);
        });

        page += 1;
      } else {
        shouldNext = false;
      }
    } while (shouldNext);
  });

  return movieUrlSet;
};

module.exports = getMovieUrls;

// Bluebird.resolve()
//   .then(async () => {
//     const movieUrlPath = 'tmp/tmdb-movie-urls.json';
//     const movieUrlSet = await getMovieUrls();

//     fs.writeFileSync(movieUrlPath, JSON.stringify(Array.from(movieUrlSet), null, 2));
//   })
//   .catch(console.log)
//   .finally(() => process.exit(3));
