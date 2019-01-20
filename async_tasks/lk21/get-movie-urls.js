const cheerio = require('cheerio');
const utils = require('../../src/utils');

const constant = {
  baseUrl: 'http://lk21.red/',
};

const getMovieUrls = async () => {
  const movieUrls = [];
  let shouldNext = true;

  let page = 1;

  do {
    let url;

    if (page === 1) {
      url = constant.baseUrl;
    } else {
      url = `${constant.baseUrl}page/${page}`;
    }

    console.log('Start ', url);

    const response = await utils.get(url);

    const $ = cheerio.load(response.text);
    const entries = $('#gmr-main-load article.type-post h2.entry-title a');

    if (entries.length > 0) {
      $('#gmr-main-load article.type-post h2.entry-title a').each((index, elem) => {
        const movieUrl = $(elem).attr('href');

        movieUrls.push(movieUrl);
      });

      page += 1;
    } else {
      shouldNext = false;
    }
  } while (shouldNext);

  return movieUrls;
};

module.exports = getMovieUrls;
