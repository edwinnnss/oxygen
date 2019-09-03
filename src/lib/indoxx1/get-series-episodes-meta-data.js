const Bluebird = require('bluebird');
const cheerio = require('cheerio');
const _ = require('lodash');
const request = require('superagent');

const { getVariableValue, modifySourceMetaData } = require('./utils');
const getSeriesEpisodes = require('./get-series-episodes');

const decoder = require('./decoder');

const getSeriesEpisodesMetadata = async (movieUrl, keyStr, playResponse) => {
  console.log('calling getSeriesEpisodesMetadata()');

  const $ = cheerio.load(playResponse);
  const tmdbId = $('#downloadmv').attr('data-tmdb');
  const cookieName = getVariableValue(playResponse, 'var tvkuki = "', '"');
  const tsDiv = getVariableValue(playResponse, 'var tsdiv = ', ';');
  let episodes = await getSeriesEpisodes(playResponse, movieUrl);

  if (typeof episodes === 'string') {
    return episodes;
  }

  episodes = await Bluebird.map(episodes, async (episode) => {
    const tokenUrl = decoder.getFilmSeriesTokenUrl(
      cookieName,
      tsDiv,
      tmdbId,
      episode.eps,
      episode.prov,
      episode.nno,
    );

    console.log('Request token to', tokenUrl, movieUrl);
    const encoded = await request.get(tokenUrl)
      .set('Referer', movieUrl)
      .set('Accept', '*/*')
      .set('Origin', process.env.SOURCE_URL)
      .set('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');

    const encodedText = decoder.rc4(keyStr, encoded.text);

    if (!encodedText) {
      return episode;
    }

    episode.sourceMetaData = _.compact(await modifySourceMetaData(JSON.parse(encodedText)));

    return episode;
  }, { concurrency: 5 });

  return episodes;
};

module.exports = getSeriesEpisodesMetadata;
