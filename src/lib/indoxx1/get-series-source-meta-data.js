// const Bluebird = require('bluebird');
// const cheerio = require('cheerio');
// const _ = require('lodash');
// const superagent = require('superagent').agent();

// const { getVariableValue, modifySourceMetaData } = require('./utils');

// const decoder = require('./decoder');

// const request = Bluebird.promisifyAll(superagent);

// const getTotalEpisodes = (playResponse) => {
//   let episodesHtml = getVariableValue(playResponse.text, 'var episodes = \'', '\'');
//   episodesHtml = episodesHtml.substring(0, episodesHtml.length - 1);
//   const $ = cheerio.load(episodesHtml);

//   const episodes = [];

//   $('a').each((index, elem) => {
//     const episode = $(elem).attr('id').split('-')[1];
//     const title = $(elem).attr('title');

//     episodes.push(`${index + 1} | ${episode} | ${title}`);
//   });

//   return episodes;
// };

// const sortEpisodes = rawSourceMetaData => Bluebird.resolve()
//   .then(async () => {
//     const tasks = [];

//     _.forEach(rawSourceMetaData, (data) => {
//       _.mapValues(data, (v, k) => {
//         tasks.push({
//           [k]: modifySourceMetaData(v),
//         });
//       });
//     });

//     const sourceMetaData = await Bluebird.map(tasks, task => Bluebird.props(task), { concurrency: 5 });

//     const sorted = sourceMetaData.sort((a, b) => {
//       const keyA = _.chain(a)
//         .split(' | ')
//         .head()
//         .keys()
//         .head()
//         .toNumber()
//         .value();

//       const keyB = _.chain(b)
//         .split(' | ')
//         .head()
//         .keys()
//         .head()
//         .toNumber()
//         .value();

//       if (keyA > keyB) {
//         return -1;
//       }

//       return 1;
//     });

//     return sorted;
//   });

// const getSeriesSourceMetaData = async (movieUrl, keyStr, playResponse) => {
//   const $ = cheerio.load(playResponse.text);
//   const tmdbId = $('#downloadmv').attr('data-tmdb');
//   const cookieName = getVariableValue(playResponse.text, 'var tvkuki = "', '"');
//   const tsDiv = getVariableValue(playResponse.text, 'var tsdiv = ', ';');
//   const episodes = getTotalEpisodes(playResponse);

//   const seriesSourceMetaData = [];

//   await Bluebird.map(episodes, async (rawEpisode) => {
//     const [index, episode, title] = rawEpisode.split(' | ');
//     const tokenUrl = decoder.getFilmSeriesTokenUrl(cookieName, tsDiv, tmdbId, episode, title, index);

//     console.log('Request token to', tokenUrl);
//     const encoded = await request.get(tokenUrl)
//       .set('Referer', movieUrl)
//       .set('Accept', '*/*')
//       .set('Origin', 'https://indoxxi.bz')
//       .set('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');

//     const encodedText = decoder.decode(keyStr, encoded.text);

//     if (!encodedText) {
//       return;
//     }

//     const sourceMetaData = _.compact(await modifySourceMetaData(JSON.parse(encodedText)));

//     seriesSourceMetaData.push({ [`${index} | ${title}`]: sourceMetaData });
//   }, { concurrency: 5 });

//   return _.compact(await sortEpisodes(seriesSourceMetaData));
// };

// module.exports = getSeriesSourceMetaData;
