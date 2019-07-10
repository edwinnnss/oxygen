const fs = require('fs');
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

/* eslint-disable */
// from script 136.js
function calcTime(e, $) {
  var t = new Date,
      i = t.getTime() + 6e4 * t.getTimezoneOffset(),
      o = new Date(i + 252e5);
  if ($("#svtime").length) {
      var s = parseInt($("#svtime").val());
      console.log('using svtime', s);
      o = e ? new Date(s) : s / 1e3
  }
  return o
}
/* eslint-enable */

const getNewEpisodes = async (playResponse, movieUrl) => {
  const $ = cheerio.load(playResponse);
  const tmdbId = $('#downloadmv').attr('data-tmdb');

  const tdb = btoa(tmdbId);

  // loadTV
  const a = calcTime('+7', $);

  let r = a.getMinutes();
  r %= 5;

  const n = 1e3 * a.getSeconds();
  const l = new Date(a - 6e4 * r - n);
  let d = Math.floor(l.getTime() / 1e3);
  d = (new Date).getTime();

  const episodes = await request.get('https://content.akubebas.com/episodes', {
    qs: {
      tdb,
      ts: d,
    },
    json: true,
  });
  console.log(episodes, typeof episodes, movieUrl, 'result from https://content.akubebas.com/episodes');

  if (typeof episodes === 'string') {
    fs.appendFile('tmp/tv-fail.txt', movieUrl + '\r\n');
  }

  return episodes;
};

module.exports = getNewEpisodes;
