const _ = require('lodash');
const Bluebird = require('bluebird');

const Movie = require('../../database/models/movie');

const getKeyString = require('../../lib/indoxx1/get-key-string');
const getSourceMetaData = require('../../lib/indoxx1/get-source-meta-data');
const { get, checkResponse } = require('../../utils');

const BANNED_TYPE = new Set(['drives_muvi', 'drives_lk21', 'drives']);

const renameLabel = (source) => {
  if (_.toLower(source.label) === 'hd') {
    source.label = '720p';
  } else if (_.toLower(source.label) === 'sd') {
    source.label = '360p';
  }

  return source;
};

const filterResponse = async (source) => {
  if (_.get(source, 'file', '').indexOf('youtube') >= 0) {
    source.file = source.file.replace('watch?v=', 'embed/');

    return source;
  }

  if (_.get(source, 'file', '').indexOf('google') >= 0) {
    let statusCode;

    try {
      const { status } = await checkResponse(source.file);
      statusCode = status;
    } catch (errResponse) {
      statusCode = errResponse.status;
    }

    if (statusCode < 200 || statusCode >= 300) {
      return Bluebird.resolve();
    }

    return source;
  }

  return source;
};

const filterOffLabel = (sub) => {
  if (sub.label === 'off') {
    return Bluebird.resolve();
  }

  return sub;
};

const modifySourceMetaData = async (sourceMetaData) => {
  const storeMetaIds = [];

  return Bluebird.map(sourceMetaData, async (data) => {
    if (_.isArray(data)) {
      return _.chain(data)
        .map(filterOffLabel)
        .compact()
        .value();
    }

    const metaType = _.get(data, 'meta.type');
    if (BANNED_TYPE.has(metaType)) {
      return Bluebird.resolve();
    }

    // remove duplicate sourceMeta based on metaId
    const metaId = _.get(data, 'meta.id');
    if (metaId) {
      if (_.includes(storeMetaIds, metaId)) return Bluebird.resolve();
      storeMetaIds.push(metaId);
    }

    let sourcesPatch = _.map(data.sources, renameLabel);
    sourcesPatch = _.compact(await Bluebird.map(sourcesPatch, filterResponse));

    if (_.compact(sourcesPatch).length === 0) {
      return Bluebird.resolve();
    }

    data.sources = sourcesPatch;

    return data;
  });
};

module.exports = (req, res) => Bluebird.resolve()
  .then(async () => {
    const { slug } = req.params;
    const movie = await Movie
      .findOne({ slug })
      .select('name sourceMetaData source');

    if (!movie) {
      return res.send(null);
    }

    try {
      const playUrl = movie.source + '/play';

      const [keyString, playResponse] = await Bluebird.all([
        await getKeyString(movie.source),
        await get(playUrl),
      ]);

      const sourceMetaDataFromWebsite = _.compact(await getSourceMetaData(movie.source, keyString, playResponse));

      if (sourceMetaDataFromWebsite) {
        movie.sourceMetaData = _.compact(await modifySourceMetaData(sourceMetaDataFromWebsite));

        await movie.save();
      }
    } catch (error) {
      console.log(error);
      console.log('Error while get source meta data from indoxx1', JSON.stringify(error, null, 2));
    }

    return res.send(movie);
  })
  .catch(console.log);
