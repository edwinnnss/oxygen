const _ = require('lodash');
const Bluebird = require('bluebird');

const Movie = require('../../database/models/movie');

const getKeyString = require('../../lib/indoxx1/get-key-string');
const getSourceMetaData = require('../../lib/indoxx1/get-source-meta-data');
const getSeriesSourceMetaData = require('../../lib/indoxx1/get-series-source-meta-data');
const { get } = require('../../utils');
const indoXx1Utils = require('../../lib/indoxx1/utils');

module.exports = (req, res) => Bluebird.resolve()
  .then(async () => {
    const { slug } = req.params;
    const movie = await Movie
      .findOne({ slug })
      .select('name sourceMetaData source type');

    if (!movie) {
      return res.send(null);
    }

    try {
      let playUrl = movie.source + '/play';

      if (movie.type === 'film-series') {
        playUrl = movie.source + '/playtv';
      }

      const [keyString, playResponse] = await Bluebird.all([
        await getKeyString(movie.source),
        await get(playUrl),
      ]);

      let sourceMetaDataFromWebsite;
      if (movie.type === 'film-series') {
        sourceMetaDataFromWebsite = await getSeriesSourceMetaData(playUrl, keyString, playResponse);
      } else {
        sourceMetaDataFromWebsite = await getSourceMetaData(movie.source, keyString, playResponse);
      }

      if (sourceMetaDataFromWebsite && movie.type !== 'film-series') {
        movie.sourceMetaData = _.compact(await indoXx1Utils.modifySourceMetaData(sourceMetaDataFromWebsite));

        await movie.save();
      } else if (sourceMetaDataFromWebsite && movie.type === 'film-series') {
        const tasks = [];

        _.forEach(sourceMetaDataFromWebsite, (data) => {
          _.mapValues(data, (v, k) => {
            tasks.push({
              [k]: indoXx1Utils.modifySourceMetaData(v),
            });
          });
        });

        const sourceMetaData = await Bluebird.map(tasks, task => Bluebird.props(task));

        const sorted = sourceMetaData.sort((a, b) => {
          const keyA = _.chain(a).keys().head().toNumber()
            .value();
          const keyB = _.chain(b).keys().head().toNumber()
            .value();

          if (keyA < keyB) {
            return -1;
          }

          return 1;
        });

        movie.sourceMetaData = sorted;

        await movie.save();
      }
    } catch (error) {
      console.log(error);
      console.log('Error while get source meta data from indoxx1', JSON.stringify(error, null, 2));
    }

    return res.send(movie);
  })
  .catch(console.log);
