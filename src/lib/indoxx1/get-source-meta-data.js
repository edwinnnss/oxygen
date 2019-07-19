const cheerio = require('cheerio');
const _ = require('lodash');
const request = require('request-promise');
// const superagent = require('superagent');

const { getVariableValue, modifySourceMetaData } = require('./utils');

const decoder = require('./decoder');

const getSourceMetaData = async (movieUrl, keyStr, playResponse) => {
  const $ = cheerio.load(playResponse);
  const cookieName = getVariableValue(playResponse, 'var cookie_name="', '"');
  const ts2 = getVariableValue(playResponse, 'ts2=', ';');
  const tmdbId = $('#downloadmv').attr('data-tmdb');
  const tokenUrl = decoder.getTokenUrl(cookieName, tmdbId, ts2);

  console.log('Request token to', tokenUrl);

  // const encoded = await superagent.get(tokenUrl)
  //   .set('Referer', movieUrl)
  //   .set('Accept', '*/*')
  //   .set('Origin', 'https://indoxx1.network')
  //   .set('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');

  const encoded = await request.get(tokenUrl, {
    headers: {
      'Referer': movieUrl,
      'Accept': '*/*',
      'Origin': 'https://indoxx1.network',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
    },
  });

  const encodedText = decoder.rc4(keyStr, encoded);

  if (!encodedText) {
    return undefined;
  }

  const sourceMetaData = await modifySourceMetaData(JSON.parse(encodedText));

  return _.compact(sourceMetaData);
};

module.exports = getSourceMetaData;
