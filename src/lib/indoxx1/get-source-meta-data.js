const Bluebird = require('bluebird');
const cheerio = require('cheerio');
const _ = require('lodash');
const superagent = require('superagent').agent();

// const { checkResponse } = require('../../utils');

const decoder = require('./decoder');

const request = Bluebird.promisifyAll(superagent);

const BANNED_TYPE = new Set(['drives_muvi', 'drives_lk21', 'drives']);

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

const renameLabel = (source) => {
  if (_.toLower(source.label) === 'hd') {
    source.label = '720p';
  } else if (_.toLower(source.label) === 'sd') {
    source.label = '360p';
  }

  return source;
};

const filterResponse = async (source) => {
  if (_.get(source, 'file', '').indexOf('youtube') >= 0) {
    source.file = source.file.replace('watch?v=', 'embed/');

    return source;
  }

  // if (_.get(source, 'file', '').indexOf('google') >= 0) {
  //   let statusCode;

  //   try {
  //     const { status } = await checkResponse(source.file);
  //     statusCode = status;
  //   } catch (errResponse) {
  //     statusCode = errResponse.status;
  //   }

  //   if (statusCode < 200 || statusCode >= 300) {
  //     return Bluebird.resolve();
  //   }

  //   return source;
  // }

  return source;
};

const filterOffLabel = (sub) => {
  if (sub.label === 'off') {
    return Bluebird.resolve();
  }

  return sub;
};

const modifySourceMetaData = async sourceMetaData => Bluebird.map(sourceMetaData, async (data) => {
  if (!data) {
    return data;
  }

  if (_.isArray(data)) {
    return _.chain(data)
      .map(filterOffLabel)
      .compact()
      .value();
  }

  const metaType = _.get(data, 'meta.type');
  if (BANNED_TYPE.has(metaType)) {
    return Bluebird.resolve();
  }

  let sourcesPatch = _.map(data.sources, renameLabel);
  sourcesPatch = _.compact(await Bluebird.map(sourcesPatch, filterResponse));

  if (_.compact(sourcesPatch).length === 0) {
    return Bluebird.resolve();
  }

  data.sources = sourcesPatch;

  return data;
})
  .then(_.compact);

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

  const sourceMetaData = await modifySourceMetaData(JSON.parse(encodedText));

  return _.compact(sourceMetaData);
};

module.exports = getSourceMetaData;
