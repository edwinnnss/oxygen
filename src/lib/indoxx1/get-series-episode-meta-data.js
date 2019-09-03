const cheerio = require('cheerio');
const _ = require('lodash');
const request = require('request-promise');
// const superagent = require('superagent');

const { getVariableValue, modifySourceMetaData } = require('./utils');
const { retry } = require('../../utils');

const decoder = require('./decoder');

const getSeriesSourceMetaData = async (movieUrl, keyStr, playResponse, episodes, indexQuery) => {
  console.log('calling getSeriesSourceMetaData()');
  const $ = cheerio.load(playResponse);
  const tmdbId = $('#downloadmv').attr('data-tmdb');
  const cookieName = getVariableValue(playResponse, 'var tvkuki = "', '"');
  const tsDiv = getVariableValue(playResponse, 'var tsdiv = ', ';');

  const episode = _.find(episodes, { eps: indexQuery + '' });
  const episodeIndex = _.findIndex(episodes, { eps: indexQuery + '' });

  if (episodeIndex < 0 || !episode) {
    return episodes;
  }
  const tokenUrl = decoder.getFilmSeriesTokenUrl(cookieName, tsDiv, tmdbId, episode.eps, episode.prov, episode.nno);

  console.log('Request token to', tokenUrl);
  // const encoded = await retry(() => request.get(tokenUrl)
  //   .set('Referer', movieUrl)
  //   .set('Accept', '*/*')
  //   .set('Origin', process.env.SOURCE_URL)
  //   .set('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'));
  const encoded = await retry(() => request.get(tokenUrl, {
    headers: {
      'Referer': movieUrl,
      'Accept': '*/*',
      'Origin': process.env.SOURCE_URL,
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
    },
  }));
  console.log(encoded, 'ENCODED');

  const encodedText = decoder.rc4(keyStr, encoded);
  console.log(JSON.parse(encodedText)[0], 'ENCODED RESULT SOURCEMETADATA');

  if (!encodedText) {
    return episodes;
  }

  const extractedSourceMetaData = _.compact(await modifySourceMetaData(JSON.parse(encodedText)));

  episode.sourceMetaData = extractedSourceMetaData;
  episodes[episodeIndex] = episode;

  return episodes;
};

module.exports = getSeriesSourceMetaData;
