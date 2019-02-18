const Bluebird = require('bluebird');
const cheerio = require('cheerio');
const _ = require('lodash');
const superagent = require('superagent').agent();

const { getVariableValue, modifySourceMetaData } = require('./utils');

const decoder = require('./decoder');

const request = Bluebird.promisifyAll(superagent);

const getTotalEpisodes = (playResponse) => {
  let episodesHtml = getVariableValue(playResponse.text, 'var episodes = \'', ';');
  episodesHtml = episodesHtml.substring(0, episodesHtml.length - 1);
  const $ = cheerio.load(episodesHtml);

  return $('a').length;
};

const getSeriesSourceMetaData = async (movieUrl, keyStr, playResponse) => {
  const $ = cheerio.load(playResponse.text);
  const tmdbId = $('#downloadmv').attr('data-tmdb');
  const cookieName = getVariableValue(playResponse.text, 'var tvkuki = "', '"');
  const tsDiv = getVariableValue(playResponse.text, 'var tsdiv = ', ';');
  const totalEpisodes = getTotalEpisodes(playResponse);

  const seriesSourceMetaData = [];

  await Bluebird.map(_.range(1, totalEpisodes + 1), async (episode) => {
    const tokenUrl = decoder.getFilmSeriesTokenUrl(cookieName, tsDiv, tmdbId, episode);

    console.log('Request token to', tokenUrl);
    const encoded = await request.get(tokenUrl)
      .set('Referer', movieUrl)
      .set('Accept', '*/*')
      .set('Origin', 'https://indoxxi.bz')
      .set('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');

    const encodedText = decoder.decode(keyStr, encoded.text);

    if (!encodedText) {
      return;
    }

    const sourceMetaData = _.compact(await modifySourceMetaData(JSON.parse(encodedText)));

    seriesSourceMetaData.push({ [episode]: sourceMetaData });
  });

  return _.compact(seriesSourceMetaData);
};

module.exports = getSeriesSourceMetaData;
