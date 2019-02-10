require('../../init');

const Bluebird = require('bluebird');
const _ = require('lodash');
const cheerio = require('cheerio');

const getSourceMetaData = require('./get-source-meta-data');
const utils = require('../../utils');
const getKeyStr = require('./get-key-string');

const baseUrl = 'https://indoxxi.bz';

const getValueBetweenBracket = (str) => {
  const firstBracket = _.indexOf(str, '(');
  const lastBracket = _.indexOf(str, ')');

  return str.slice(firstBracket + 1, lastBracket);
};

const getMovie = (slug, movieType) => Bluebird.resolve()
  .then(async () => {
    const movieUrl = baseUrl + slug;
    const playUrl = movieUrl + '/play';

    console.log('Start extract data from', movieUrl, new Date());
    const [keyStr, response, playResponse] = await Bluebird.all([
      await getKeyStr(movieUrl),
      await utils.get(movieUrl),
      await utils.get(playUrl),
    ]);

    if (response.status >= 300 || response.status < 200) {
      return undefined;
    }

    const sourceMetaData = await getSourceMetaData(movieUrl, keyStr, playResponse);
    // const response = await utils.get(movieUrl);

    const $ = cheerio.load(response.text);
    const posterUrl = getValueBetweenBracket($('div.mvic-thumb').attr('style'));
    const coverImageUrl = getValueBetweenBracket($('#mv-ply').attr('style'));
    const duration = _.replace($('#mv-info > div.mvi-content > div.mvic-desc > div.mvic-info > div.mvici-right > p:nth-child(1)'), /[^0-9]/g, '');
    const name = $('[itemprop="name"]').attr('content'); // <h3>(movie), <meta>(film)
    const releasedText = $('meta[itemprop="datePublished"]').attr('content');
    const summary = $('div[itemprop="description"]').text();
    const trailerUrl = $('#iframe-trailer').attr('src');
    const quality = _.trim($('span.quality').text());
    const ratingValue = $('span[itemprop="ratingValue"]').text();
    const ratingCount = $('span[itemprop="ratingCount"]').text();

    const countries = [];
    $('#mv-info > div.mvi-content > div.mvic-desc > div.mvic-info > div.mvici-right > p:nth-child(4) > a').each((index, elem) => {
      const country = $(elem).text();

      countries.push({
        label: _.trim(country),
        slug: _.kebabCase(country),
      });
    });

    const directors = _.chain($('span[itemprop="director"]').text())
      .split(',')
      .map((v) => {
        return {
          label: _.trim(v),
          slug: _.kebabCase(v),
        };
      })
      .value();

    const stars = _.chain($('span[itemprop="actor"]').text())
      .split(',')
      .map((v) => {
        return {
          label: _.trim(v),
          slug: _.kebabCase(v),
        };
      })
      .value();

    const genres = [];
    $('#mv-info > div.mvi-content > div.mvic-desc > div.mvic-info > div.mvici-left > p:nth-child(1) a').each((index, elem) => {
      const genre = $(elem).text();

      genres.push({
        label: _.trim(genre),
        slug: _.kebabCase(genre),
      });
    });

    const keywords = [];
    $('#mv-label a').each((index, elem) => {
      const keyword = $(elem).text();

      keywords.push(keyword);
    });

    const [year, month, day] = _.toString(releasedText).split('-');

    const released = {
      year: _.replace(year, /[^0-9]/g, ''),
      month: _.replace(month, /[^0-9]/g, ''),
      day: _.replace(day, /[^0-9]/g, ''),
    };

    return {
      countries,
      coverImageUrl,
      directors,
      duration,
      genres,
      keywords,
      name,
      posterUrl,
      quality,
      ratingCount,
      ratingValue: (ratingValue === 'N/A') ? '0' : ratingValue,
      released,
      slug: _.kebabCase(`${name}-${released.year || ''}`),
      source: movieUrl,
      sourceMetaData,
      stars,
      summary,
      trailerUrl,
      type: movieType,
    };
  });

module.exports = getMovie;

// Bluebird.resolve()
//   .then(async () => {
//     const movie = await getMovie('/film-seri/crashing-season-3-2019-1h5us3');
//     console.log(JSON.stringify(movie, null, 2));
//   })
//   .catch(console.log)
//   .finally(() => process.exit(3));
