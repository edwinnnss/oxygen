const cheerio = require('cheerio');

const utils = require('../../utils');

const movieTypeMapping = {
  movie: process.env.SOURCE_URL + '/muvi',
  'film-series': process.env.SOURCE_URL + '/tv',
  'film-semi': process.env.SOURCE_URL + '/film-semi-terbaru',
};

const getMovieUrls = async (movieType) => {
  const movieUrlSet = new Set();
  const indoxxiUrl = movieTypeMapping[movieType];

  const url = indoxxiUrl;

  console.log(`${movieUrlSet.size} | Start ${url}`);

  const response = await utils.get(url);

  const $ = cheerio.load(response);

  const entries = $('#movie-featured div a').length;

  if (entries > 0) {
    $('#movie-featured div a').each((index, elem) => {
      const movieUrl = $(elem).attr('href');

      movieUrlSet.add(movieUrl);
    });
  }

  return Array.from(movieUrlSet);
};

module.exports = getMovieUrls;
