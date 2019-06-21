const Bluebird = require('bluebird');
const cheerio = require('cheerio');
const _ = require('lodash');
const superagent = require('superagent').agent();

const { getVariableValue, modifySourceMetaData } = require('./utils');
const { retry } = require('../../utils');

const decoder = require('./decoder');

const request = Bluebird.promisifyAll(superagent);

const getSeriesSourceMetaData = async (movieUrl, keyStr, playResponse, episodes, indexQuery) => {
  const $ = cheerio.load(playResponse.text);
  const tmdbId = $('#downloadmv').attr('data-tmdb');
  const cookieName = getVariableValue(playResponse.text, 'var tvkuki = "', '"');
  const tsDiv = getVariableValue(playResponse.text, 'var tsdiv = ', ';');


  const episode = _.find(episodes, { index: indexQuery });
  const episodeIndex = _.findIndex(episodes, { index: indexQuery });
  console.log(episodes);
  if (episodeIndex < 0 || !episode) {
    return episodes;
  }

  const tokenUrl = decoder.getFilmSeriesTokenUrl(cookieName, tsDiv, tmdbId, episode.episode, episode.title, episode.index);

  console.log('Request token to', tokenUrl);
  const encoded = await retry(() => request.get(tokenUrl)
    .set('Referer', movieUrl)
    .set('Accept', '*/*')
    .set('Origin', 'https://indoxxi.studio')
    .set('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'));

  const encodedText = decoder.decode(keyStr, encoded.text);

  if (!encodedText) {
    return episodes;
  }

  const extractedSourceMetaData = _.compact(await modifySourceMetaData(JSON.parse(encodedText)));

  episode.sourceMetaData = extractedSourceMetaData;
  episodes[episodeIndex] = episode;

  console.log(episodes);
  return episodes;
};

module.exports = getSeriesSourceMetaData;
