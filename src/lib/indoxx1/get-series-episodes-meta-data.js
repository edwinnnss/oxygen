const Bluebird = require('bluebird');
const cheerio = require('cheerio');
const _ = require('lodash');
const superagent = require('superagent').agent();

const { getVariableValue, modifySourceMetaData } = require('./utils');
const getSeriesEpisodes = require('./get-series-episodes');

const decoder = require('./decoder');

const request = Bluebird.promisifyAll(superagent);

const getSeriesEpisodesMetadata = async (movieUrl, keyStr, playResponse) => {
  const $ = cheerio.load(playResponse.text);
  const tmdbId = $('#downloadmv').attr('data-tmdb');
  const cookieName = getVariableValue(playResponse.text, 'var tvkuki = "', '"');
  const tsDiv = getVariableValue(playResponse.text, 'var tsdiv = ', ';');
  let episodes = getSeriesEpisodes(playResponse);

  episodes = await Bluebird.map(episodes, async (episode) => {
    const tokenUrl = decoder.getFilmSeriesTokenUrl(cookieName, tsDiv, tmdbId, episode.episode, episode.title, episode.index);

    console.log('Request token to', tokenUrl);
    const encoded = await request.get(tokenUrl)
      .set('Referer', movieUrl)
      .set('Accept', '*/*')
      .set('Origin', 'https://indoxxi.bz')
      .set('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');

    const encodedText = decoder.decode(keyStr, encoded.text);

    if (!encodedText) {
      return episode;
    }

    episode.sourceMetaData = _.compact(await modifySourceMetaData(JSON.parse(encodedText)));

    return episode;
  }, { concurrency: 5 });

  return episodes;
};

module.exports = getSeriesEpisodesMetadata;
