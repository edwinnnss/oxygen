const Bluebird = require('bluebird');
const cheerio = require('cheerio');

const superagent = require('superagent').agent();
const decoder = require('./decoder');

const request = Bluebird.promisifyAll(superagent);

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

  if (!encodedText) {
    return undefined;
  }

  return JSON.parse(encodedText);
};

module.exports = getSourceMetaData;
