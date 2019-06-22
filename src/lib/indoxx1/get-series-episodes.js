const cheerio = require('cheerio');
const btoa = require('btoa');
const request = require('request-promise');

const { getVariableValue } = require('./utils');

// const getEpisodes = async (playResponse) => {
//   let episodesHtml = getVariableValue(playResponse, 'var episodes = \'', '\'');
//   episodesHtml = episodesHtml.substring(0, episodesHtml.length - 1);
//   const $ = cheerio.load(episodesHtml);

//   const episodes = [];

//   $('a').each((index, elem) => {
//     const episode = $(elem).attr('id').split('-')[1];
//     const title = $(elem).attr('title');

//     episodes.push({
//       index: index + 1, episode, title,
//     });
//   });

//   return episodes;
// };

const getNewEpisodes = async (playResponse) => {
  const $ = cheerio.load(playResponse);
  const tmdbId = $('#downloadmv').attr('data-tmdb');

  const tdb = btoa(tmdbId);

  const episodes = await request.get('https://content.akubebas.com/episodes', {
    qs: { tdb },
    json: true,
  });

  return episodes;
};

module.exports = getNewEpisodes;
