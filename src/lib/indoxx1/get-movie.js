require('../../init');

const Bluebird = require('bluebird');
const _ = require('lodash');
const cheerio = require('cheerio');

const superagent = require('superagent').agent();
const decoder = require('./decoder');
const utils = require('../../utils');

const request = Bluebird.promisifyAll(superagent);

const baseUrl = 'https://indoxxi.bz';

const getVariableValue = (responseText, keyword, endChar) => {
  const keywordIndex = responseText.indexOf(keyword);
  let index = keywordIndex + keyword.length;

  let value = '';
  let next = true;

  while (next) {
    const indexChar = responseText[index];
    if (indexChar !== endChar) {
      value += indexChar;
      index += 1;
    } else {
      next = false;
    }
  }

  return value;
};

const getKeyStr = movieUrl => Bluebird.resolve()
  .then(async () => {
    const response = await request.get('https://indoxxi.bz/js/v76.js')
      .buffer(true)
      .set('Referer', movieUrl)
      .set('Accept', '*/*')
      .set('Origin', 'https://indoxxi.bz')
      .set('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');

    return getVariableValue(response.text, '_keyStr:"', '"');
  });

// const getMovieDbOrgData = async (tmdbId) => {
//   const response = await utils.get(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${process.env.TMBD_API_KEY}`);

//   return response.text;
// };

const getSourceMetaData = async (movieUrl, keyStr, playResponse) => {
  const $ = cheerio.load(playResponse.text);
  const cookieName = getVariableValue(playResponse.text, 'var cookie_name="', '"');
  const ts2 = getVariableValue(playResponse.text, 'ts2=', ';');
  const tmdbId = $('#downloadmv').attr('data-tmdb');

  const tokenUrl = decoder.getTokenUrl(cookieName, tmdbId, ts2);

  console.log('Request token to', tokenUrl);

  const encoded = await request.get(tokenUrl)
    .set('Referer', movieUrl)
    .set('Accept', '*/*')
    .set('Origin', 'https://indoxxi.bz')
    .set('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');

  const encodedText = decoder.decode(keyStr, encoded.text);
  // const data = JSON.parse(await getMovieDbOrgData(tmdbId));

  if (!encodedText) {
    return undefined;
  }

  return JSON.parse(encodedText);
};

const getValueBetweenBracket = (str) => {
  const firstBracket = _.indexOf(str, '(');
  const lastBracket = _.indexOf(str, ')');

  return str.slice(firstBracket + 1, lastBracket);
};

const getMovie = slug => Bluebird.resolve()
  .then(async () => {
    const movieUrl = baseUrl + slug;
    const playUrl = movieUrl + '/play';

    console.log('Start extract data from', movieUrl);
    const [keyStr, response, playResponse] = await Bluebird.all([
      await getKeyStr(movieUrl),
      await utils.get(movieUrl),
      await utils.get(playUrl),
    ]);

    const sourceMetaData = await getSourceMetaData(movieUrl, keyStr, playResponse);
    // const response = await utils.get(movieUrl);

    const $ = cheerio.load(response.text);
    const posterUrl = getValueBetweenBracket($('div.mvic-thumb').attr('style'));
    const coverImageUrl = getValueBetweenBracket($('#mv-ply').attr('style'));
    const duration = _.replace($('#mv-info > div.mvi-content > div.mvic-desc > div.mvic-info > div.mvici-right > p:nth-child(1)'), /[^0-9]/g, '');
    const name = $('h3[itemprop="name"]').attr('content');
    const released = $('meta[itemprop="datePublished"]').attr('content');
    const summary = $('div[itemprop="description"]').text();
    const trailerUrl = $('#iframe-trailer').attr('src');
    const quality = _.trim($('span.quality').text());
    const ratingValue = $('span[itemprop="ratingValue"]').text();
    const ratingCount = $('span[itemprop="ratingCount"]').text();

    const countries = _.chain($('#mv-info > div.mvi-content > div.mvic-desc > div.mvic-info > div.mvici-right > p:nth-child(4) > a').text())
      .split(',')
      .map(_.trim)
      .value();

    const directors = _.chain($('span[itemprop="director"]').text())
      .split(',')
      .map(_.trim)
      .value();

    const stars = _.chain($('span[itemprop="actor"]').text())
      .split(',')
      .map(_.trim)
      .value();

    const genres = [];
    $('#mv-info > div.mvi-content > div.mvic-desc > div.mvic-info > div.mvici-left > p:nth-child(1) a').each((index, elem) => {
      const genre = $(elem).text();

      genres.push(genre);
    });

    const keywords = [];
    $('#mv-label a').each((index, elem) => {
      const keyword = $(elem).text();

      keywords.push(keyword);
    });

    const year = _.chain(released)
      .split('-')
      .head()
      .value();

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
      ratingValue,
      released,
      slug: _.kebabCase(name + year || ''),
      source: movieUrl,
      sourceMetaData,
      stars,
      summary,
      trailerUrl,
    };
  });

module.exports = getMovie;

// Bluebird.resolve()
//   .then(async () => {
//     const movie = await getMovie('/movie/io-2019-9aap');
//     console.log(movie);
//   })
//   .catch(console.log)
//   .finally(() => process.exit(3));
