const cheerio = require('cheerio');

const { getVariableValue } = require('./utils');

const getEpisodes = async (playResponse) => {
  let episodesHtml = getVariableValue(playResponse.text, 'var episodes = \'', '\'');
  episodesHtml = episodesHtml.substring(0, episodesHtml.length - 1);
  const $ = cheerio.load(episodesHtml);

  const episodes = [];

  $('a').each((index, elem) => {
    const episode = $(elem).attr('id').split('-')[1];
    const title = $(elem).attr('title');

    episodes.push({
      index: index + 1, episode, title,
    });
  });

  return episodes;
};

module.exports = getEpisodes;
